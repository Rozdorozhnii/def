import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AbstractRepository } from '@app/common';
import { SettingsDocument } from '../models/settings.schema';

@Injectable()
export class SettingsRepository extends AbstractRepository<SettingsDocument> {
  protected readonly logger = new Logger(SettingsRepository.name);

  constructor(
    @InjectModel(SettingsDocument.name)
    model: Model<SettingsDocument>,
  ) {
    super(model);
  }
}
