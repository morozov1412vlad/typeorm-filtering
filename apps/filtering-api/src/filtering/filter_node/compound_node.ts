import { DataSource } from 'typeorm';
import { CompoundFilter } from '../filter.types';
import { AttributeFilterNode } from './base';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { ConditionalBlockFilterNode } from './conditional_block_node';
import { JoinData, CompoundFilterNodeResult } from './types';
import {
  getColumnMetadata,
  getSourceJoinColumn,
  getTargetJoinColumn,
  getRelationMetadata,
} from '../utils';

export class CompoundFilterNode extends AttributeFilterNode<
  CompoundFilterNodeResult,
  CompoundFilter
> {
  private relationMetadata: RelationMetadata;

  constructor(
    conditionPrefix: string,
    filter: CompoundFilter,
    dataSource: DataSource,
    parentAlias: string,
    parentTableName?: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias, parentTableName);
    if (!this.parent) {
      throw new Error(
        `Parent not found for compound filter ${this.filter.attribute}`,
      );
    }
    console.log('parent', this.parent);
    console.log('property', this.property);
    this.relationMetadata = getRelationMetadata(
      this.parent,
      this.property,
      this.dataSource,
    );
  }

  get hasMany(): boolean {
    return !(
      this.relationMetadata.isManyToOne || this.relationMetadata.isOneToOne
    );
  }

  resolve() {
    const alias = `${this.parentAlias}_${this.property}`;

    // If relation is many to one or one to one, then we can perform join and add conditions
    if (!this.hasMany) {
      const columnMetadata = getColumnMetadata(
        this.parent!,
        this.property,
        this.dataSource,
      );

      const targetTableName =
        this.relationMetadata.inverseEntityMetadata.tableName;

      const conditionNode = new ConditionalBlockFilterNode(
        `${this.conditionPrefix}_${this.property}`,
        this.filter.filters,
        this.dataSource,
        alias,
        this.filter.attribute,
        targetTableName,
      ).resolve();

      return {
        condition: conditionNode.condition,
        joins: [
          {
            entity: targetTableName,
            alias,
            on: `${this.parentAlias}.${getSourceJoinColumn(columnMetadata)} = ${alias}.${getTargetJoinColumn(columnMetadata)}`,
          },
          ...conditionNode.joins,
        ],
        subQueryParameters: conditionNode.subQueryParameters,
      };
    }

    // If relation is one to many, then we need to have unique alias for each join.
    // F.e. we have table of authors and books. We want to filter authors that have fiction book and biography book.
    // We can't perform single join, because condition (books.type = 'fiction' AND books.type = 'biography') will result in no rows.
    // That's why we need to join the same table multiple times.
    if (this.relationMetadata.isOneToMany) {
      const uniqueAlias = `${this.conditionPrefix}_${this.property}`;

      if (!this.relationMetadata.inverseRelation) {
        throw new Error(
          `Inverse relation not found for one to many relation for filter ${this.filter.attribute}`,
        );
      }

      const columnMetadata = getColumnMetadata(
        this.relationMetadata.inverseEntityMetadata.tableName,
        this.relationMetadata.inverseRelation.propertyName,
        this.dataSource,
      );

      const targetTableName =
        this.relationMetadata.inverseEntityMetadata.tableName;

      const conditionNode = new ConditionalBlockFilterNode(
        `${this.conditionPrefix}_${this.property}`,
        this.filter.filters,
        this.dataSource,
        uniqueAlias,
        this.filter.attribute,
        targetTableName,
      ).resolve();

      return {
        condition: conditionNode.condition,
        joins: [
          {
            entity: targetTableName,
            alias: uniqueAlias,
            on: `${this.parentAlias}.${getTargetJoinColumn(columnMetadata)} = ${uniqueAlias}.${getSourceJoinColumn(columnMetadata)}`,
          },
          ...conditionNode.joins,
        ],
        subQueryParameters: conditionNode.subQueryParameters,
      };
    }

    // One-to-many using subqueries
    // if (this.relationMetadata.isOneToMany) {
    //   const columnMetadata = getColumnMetadata(
    //     this.relationMetadata.inverseEntityMetadata.tableName,
    //     this.relationMetadata.inverseRelation.propertyName,
    //     this.dataSource,
    //   );

    //   const qb = this.dataSource
    //     .createQueryBuilder(
    //       this.relationMetadata.inverseEntityMetadata.tableName,
    //       alias,
    //     )
    //     .select(`${alias}.${getSourceJoinColumn(columnMetadata)}`);

    //   const resolvedSubQuery = new SubQueryFilterNode(
    //     `${this.conditionPrefix}_${this.property}`,
    //     this.filter,
    //     this.dataSource,
    //     qb,
    //     alias,
    //   ).resolve();

    //   return {
    //     condition: `${this.parentAlias}.${getTargetJoinColumn(columnMetadata)} IN (${resolvedSubQuery.qb.getQuery()})`,
    //     subQueryParameters: [
    //       ...resolvedSubQuery.subQueryParameters,
    //       resolvedSubQuery.qb.getParameters(),
    //     ],
    //   };
    // }

    if (this.relationMetadata.isManyToMany) {
      if (!this.relationMetadata.junctionEntityMetadata) {
        throw new Error(
          `Junction entity metadata not found for many to many relation for filter ${this.filter.attribute}`,
        );
      }
      if (!this.relationMetadata.inverseRelation) {
        throw new Error(
          `Inverse relation not found for many to many relation for filter ${this.filter.attribute}`,
        );
      }

      const junctionTableName =
        this.relationMetadata.junctionEntityMetadata.tableName;
      const isOwningSide = this.relationMetadata.isOwning;
      const targetTableName =
        this.relationMetadata.inverseRelation.entityMetadata.tableName;

      const junctionTableAlias = `${this.conditionPrefix}_${junctionTableName}`;
      const targetTableAlias = `${junctionTableAlias}_${targetTableName}`;

      if (isOwningSide) {
        const joinColumn = this.relationMetadata.joinColumns[0];
        const inverseJoinColumn = this.relationMetadata.inverseJoinColumns[0];

        if (!joinColumn.referencedColumn) {
          throw new Error(
            `Referenced column not found for join column for many to many relation for filter ${this.filter.attribute}`,
          );
        }
        if (!inverseJoinColumn.referencedColumn) {
          throw new Error(
            `Referenced column not found for inverse join column for many to many relation for filter ${this.filter.attribute}`,
          );
        }

        const join: JoinData = {
          entity: junctionTableName,
          alias: junctionTableAlias,
          on: `${this.parentAlias}.${joinColumn.referencedColumn.databaseName} = ${junctionTableAlias}.${joinColumn.databaseName}`,
        };
        const inverseJoin: JoinData = {
          entity: targetTableName,
          alias: targetTableAlias,
          on: `${junctionTableAlias}.${inverseJoinColumn.databaseName} = ${targetTableAlias}.${inverseJoinColumn.referencedColumn.databaseName}`,
        };

        const conditionNode = new ConditionalBlockFilterNode(
          `${this.conditionPrefix}_${this.property}`,
          this.filter.filters,
          this.dataSource,
          targetTableAlias,
          this.filter.attribute,
          targetTableName,
        ).resolve();

        return {
          condition: conditionNode.condition,
          joins: [join, inverseJoin, ...conditionNode.joins],
          subQueryParameters: conditionNode.subQueryParameters,
        };
      } else {
        const owningRelation = this.relationMetadata.inverseRelation;
        const owningJoinColumn = owningRelation.joinColumns[0];
        const owningInverseJoinColumn = owningRelation.inverseJoinColumns[0];

        if (!owningInverseJoinColumn.referencedColumn) {
          throw new Error(
            `Referenced column not found for inverse join column for many to many relation for filter ${this.filter.attribute}`,
          );
        }
        if (!owningJoinColumn.referencedColumn) {
          throw new Error(
            `Referenced column not found for join column for many to many relation for filter ${this.filter.attribute}`,
          );
        }

        const join: JoinData = {
          entity: junctionTableName,
          alias: junctionTableAlias,
          on: `${this.parentAlias}.${owningInverseJoinColumn.referencedColumn.databaseName} = ${junctionTableAlias}.${owningInverseJoinColumn.databaseName}`,
        };

        const inverseJoin: JoinData = {
          entity: targetTableName,
          alias: targetTableAlias,
          on: `${junctionTableAlias}.${owningJoinColumn.databaseName} = ${targetTableAlias}.${owningJoinColumn.referencedColumn.databaseName}`,
        };

        const conditionNode = new ConditionalBlockFilterNode(
          `${this.conditionPrefix}_${this.property}`,
          this.filter.filters,
          this.dataSource,
          targetTableAlias,
          this.filter.attribute,
          targetTableName,
        ).resolve();

        return {
          condition: conditionNode.condition,
          joins: [join, inverseJoin, ...conditionNode.joins],
          subQueryParameters: conditionNode.subQueryParameters,
        };
      }
    }

    return null;
  }
}
