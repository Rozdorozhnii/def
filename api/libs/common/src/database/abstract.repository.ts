import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { Logger, NotFoundException } from '@nestjs/common';

import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(), // Ensure _id is set to a new ObjectId
    });

    return (await createdDocument.save()).toJSON() as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findandUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findById(id: Types.ObjectId | string): Promise<TDocument> {
    const document = await this.model.findById(id).lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with id', id);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findByIdAndDelete(filterQuery)
      .lean<TDocument>(true);

    if (!document) {
      this.logger.warn('Document was not found with filterQuery', filterQuery);
      throw new NotFoundException('Document was not found');
    }

    return document;
  }
}
