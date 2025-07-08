import { Injectable } from '@nestjs/common';
import { DataSource, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import {
  filterMetadataStorage,
  FilterMetadataStorage,
  EntityFilterMetadata,
} from '../metadata';
import {
  PrimitiveFilter,
  CompoundFilter,
  ConditionalBlockFilter,
  ConditionalOperator,
} from '../types.filter';
import { PrimitiveFilterOperator } from '../operator.types';
import { User } from '../../users/users.entity';
import { TargetFilterNode } from '../filter_node';
import { ClassConstructor } from 'class-transformer';

@Injectable()
export class FilterService<TEntity extends ObjectLiteral> {
  private entityConstructor: ClassConstructor<TEntity>;
  private filterMetadata: EntityFilterMetadata;

  constructor(
    private readonly dataSource: DataSource,
    private readonly filterMetadataStorage: FilterMetadataStorage,
  ) {
    // this.dataSource = _dataSource;
    // The actual entityConstructor and filterMetadata will be set *after* instantiation
    // by the custom provider factory that creates this instance.
  }

  _setContext(
    entityConstructor: ClassConstructor<TEntity>,
    filterMetadata: EntityFilterMetadata,
  ): void {
    this.entityConstructor = entityConstructor;
    this.filterMetadata = filterMetadata;
  }

  public getQueryBuilder(compoundFilter: CompoundFilter): SelectQueryBuilder<TEntity> {
    const entityMetadata = this.dataSource.getMetadata(this.entityConstructor);

    const alias = compoundFilter.attribute.split('.')[0];
    let queryBuilder = this.dataSource.createQueryBuilder<TEntity>(
      entityMetadata.tableName,
      alias,
    );

    const { qb } = new TargetFilterNode(
      '',
      compoundFilter,
      this.dataSource,
      queryBuilder,
      alias,
    ).resolve();

    return qb;
  }

  public buildDTO() {
    const entityMetadata = this.dataSource.getMetadata(this.entityConstructor);
    console.log(entityMetadata.columns);
  }
}
