import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { AbstractRepository } from '@app/common';
import { SessionDocument } from './models/session.schema';

@Injectable()
export class SessionRepository extends AbstractRepository<SessionDocument> {
  protected readonly logger = new Logger(SessionRepository.name);

  constructor(
    @InjectModel(SessionDocument.name) sessionModel: Model<SessionDocument>,
  ) {
    super(sessionModel);
  }

  async updateRefreshHash(sessionId: Types.ObjectId, hash: string) {
    await this.model.updateOne(
      { _id: sessionId },
      { $set: { refreshTokenHash: hash } },
    );
  }

  async takeActiveSessionById(
    sessionId: Types.ObjectId,
  ): Promise<SessionDocument | null> {
    return this.model
      .findOneAndUpdate(
        {
          _id: sessionId,
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        },
        {
          $set: { revokedAt: new Date() },
        },
        {
          new: false,
        },
      )
      .exec();
  }

  async revokeAllByUser(userId: Types.ObjectId) {
    return this.model.updateMany(
      { userId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  async revokeBySessionId(sessionId: Types.ObjectId) {
    return this.model.updateOne(
      { _id: sessionId, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  async revokeByRefreshHash(hash: string) {
    return this.model.updateOne(
      { refreshTokenHash: hash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  async countActiveByUser(userId: Types.ObjectId) {
    return this.model.countDocuments({
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
  }
}
