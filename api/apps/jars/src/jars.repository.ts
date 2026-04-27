import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AbstractRepository } from '@app/common';
import { JarDocument } from './models/jar.schema';

@Injectable()
export class JarsRepository extends AbstractRepository<JarDocument> {
  protected readonly logger = new Logger(JarsRepository.name);

  constructor(@InjectModel(JarDocument.name) model: Model<JarDocument>) {
    super(model);
  }
}
