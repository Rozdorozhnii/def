import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AbstractRepository } from '@app/common';
import { CollectionDocument } from './models/collection.schema';

@Injectable()
export class CollectionsRepository extends AbstractRepository<CollectionDocument> {
  protected readonly logger = new Logger(CollectionsRepository.name);

  constructor(@InjectModel(CollectionDocument.name) model: Model<CollectionDocument>) {
    super(model);
  }
}