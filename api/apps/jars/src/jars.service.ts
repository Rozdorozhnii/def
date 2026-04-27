import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateKeyPairSync } from 'crypto';

import { JarDocument, JarStatus, JarType } from './models/jar.schema';
import { JarsRepository } from './jars.repository';
import { CollectionsRepository } from './collections.repository';
import { CreateJarDto } from './dto/create-jar.dto';
import { MonobankWebhookDto } from './dto/monobank-webhook.dto';

interface MonobankJarInfo {
  jarAmount: number;
  jarGoal: number;
  jarStatus: string;
}

@Injectable()
export class JarsService implements OnModuleInit {
  private readonly logger = new Logger(JarsService.name);
  private readonly ecPublicKey: string;

  constructor(
    private readonly jarsRepository: JarsRepository,
    private readonly collectionsRepository: CollectionsRepository,
    private readonly configService: ConfigService,
  ) {
    const { publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
    const der = publicKey.export({ type: 'spki', format: 'der' });
    this.ecPublicKey = Buffer.from(der).subarray(-65).toString('base64');
  }

  async onModuleInit() {
    await this.registerWebhook();
    this.startPolling();
  }

  private startPolling() {
    const TWO_MINUTES = 2 * 60 * 1000;
    setInterval(() => {
      void this.pollFriendlyJar();
    }, TWO_MINUTES);
  }

  private async registerWebhook() {
    const token = this.configService.getOrThrow<string>('MONOBANK_TOKEN');
    const webhookUrl = `${this.configService.getOrThrow<string>('PUBLIC_URL')}/jars/webhook`;

    try {
      const res = await fetch('https://api.monobank.ua/personal/webhook', {
        method: 'POST',
        headers: { 'X-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ webHookUrl: webhookUrl }),
      });
      if (!res.ok) {
        const text = await res.text();
        this.logger.error({
          event: 'WEBHOOK_REGISTRATION_FAILED',
          status: res.status,
          text,
        });
      } else {
        this.logger.log('Monobank webhook registered');
      }
    } catch (err: unknown) {
      this.logger.error({ event: 'WEBHOOK_REGISTRATION_FAILED', err });
    }
  }

  private async pollFriendlyJar() {
    const activeJar = await this.getActiveJar();
    if (
      !activeJar ||
      activeJar.type !== JarType.FRIENDLY ||
      !activeJar.rootJarId
    )
      return;

    try {
      const data = await this.fetchMonobankJarInfo(activeJar.rootJarId);
      if (!data) return;

      const { jarAmount, jarGoal } = data;
      const balanceUah = Math.floor(jarAmount / 100);

      await this.jarsRepository.findandUpdate(
        { _id: activeJar._id },
        { $set: { balance: balanceUah } },
      );

      if (jarGoal > 0 && jarAmount >= jarGoal) {
        await this.completeAndActivateNext(activeJar, balanceUah);
      }
    } catch (err: unknown) {
      this.logger.error({ event: 'POLL_FAILED', err });
    }
  }

  private async fetchMonobankJarInfo(
    sendId: string,
  ): Promise<MonobankJarInfo | null> {
    const res = await fetch('https://send.monobank.ua/api/handler', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        c: 'hello',
        clientId: sendId,
        referer: '',
        Pc: this.ecPublicKey,
      }),
    });

    if (!res.ok) {
      this.logger.error({ event: 'MONOBANK_FETCH_FAILED', status: res.status });
      return null;
    }

    return res.json() as Promise<MonobankJarInfo>;
  }

  async getActiveJar(): Promise<JarDocument | null> {
    try {
      return await this.jarsRepository.findOne({ status: JarStatus.ACTIVE });
    } catch {
      return null;
    }
  }

  async listJars(): Promise<JarDocument[]> {
    const jars = await this.jarsRepository.find({});
    return jars.sort((a, b) => a.order - b.order);
  }

  async createJar(dto: CreateJarDto): Promise<JarDocument> {
    const allJars = await this.jarsRepository.find({});
    const maxOrder = allJars.reduce((max, j) => Math.max(max, j.order), -1);
    const hasActive = allJars.some((j) => j.status === JarStatus.ACTIVE);

    return this.jarsRepository.create({
      jarId: dto.jarId,
      rootJarId: dto.rootJarId ?? null,
      type: dto.type as JarType,
      title: dto.title,
      goal: dto.goal,
      balance: 0,
      order: maxOrder + 1,
      status: hasActive ? JarStatus.PENDING : JarStatus.ACTIVE,
      activatedAt: hasActive ? null : new Date(),
      completedAt: null,
    });
  }

  async deleteJar(id: string): Promise<void> {
    const jar = await this.jarsRepository.findOne({ _id: id });
    if (jar.status === JarStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete the active jar');
    }
    await this.jarsRepository.findOneAndDelete({ _id: id });
  }

  async handleWebhook(payload: MonobankWebhookDto): Promise<void> {
    if (payload.type !== 'StatementItem') return;

    const { account, statementItem } = payload.data;

    const activeJar = await this.getActiveJar();
    if (
      !activeJar ||
      activeJar.type !== JarType.OWN ||
      activeJar.jarId !== account
    )
      return;

    const newBalance = Math.floor(statementItem.balance / 100);

    await this.jarsRepository.findandUpdate(
      { _id: activeJar._id },
      { $set: { balance: newBalance } },
    );

    if (newBalance >= activeJar.goal) {
      await this.completeAndActivateNext(activeJar, newBalance);
    }
  }

  private async completeAndActivateNext(
    jar: JarDocument,
    finalBalance: number,
  ): Promise<void> {
    const now = new Date();

    await this.jarsRepository.findandUpdate(
      { _id: jar._id },
      { $set: { status: JarStatus.COMPLETED, completedAt: now } },
    );

    await this.collectionsRepository.create({
      jarId: jar.jarId,
      title: jar.title,
      goal: jar.goal,
      finalBalance,
      activatedAt: jar.activatedAt ?? now,
      completedAt: now,
      reportUrl: null,
    });

    const pending = await this.jarsRepository.find({
      status: JarStatus.PENDING,
    });
    const next = pending.sort((a, b) => a.order - b.order)[0];

    if (next) {
      await this.jarsRepository.findandUpdate(
        { _id: next._id },
        { $set: { status: JarStatus.ACTIVE, activatedAt: now } },
      );
    }

    await this.triggerIsr();
  }

  private async triggerIsr(): Promise<void> {
    const secret = this.configService.getOrThrow<string>('ISR_SECRET');
    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    try {
      const res = await fetch(`${frontendUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        this.logger.log('ISR revalidation triggered');
      } else {
        this.logger.error({
          event: 'ISR_REVALIDATION_FAILED',
          status: res.status,
        });
      }
    } catch (err: unknown) {
      this.logger.error({ event: 'ISR_REVALIDATION_FAILED', err });
    }
  }

  async debugTriggerCompletion(): Promise<void> {
    const activeJar = await this.getActiveJar();
    if (!activeJar) throw new BadRequestException('No active jar');
    await this.completeAndActivateNext(activeJar, activeJar.balance);
  }

  async listCollections() {
    const collections = await this.collectionsRepository.find({});
    return collections.sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
    );
  }
}
