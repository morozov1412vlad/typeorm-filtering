import {
  Brackets,
  NotBrackets,
  WhereExpressionBuilder,
  ObjectLiteral,
  DataSource,
  SelectQueryBuilder,
} from 'typeorm';

import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import {
  PrimitiveFilterOperator,
  filterNodeOperatorMap,
} from './operator.types';

import {
  PrimitiveFilter,
  CompoundFilter,
  ConditionalBlockFilter,
  ConditionalOperator,
} from './types.filter';

import {
  getColumnMetadata,
  getRelationMetadata,
  getSourceJoinColumn,
  getTargetJoinColumn,
} from './utils';

import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';

interface JoinData {
  entity: string;
  alias: string;
  on: string;
}

type SubQueryParameters = ObjectLiteral;

type PrimitiveFilterNodeResult = {
  condition: string;
  valueAliasMap: Record<string, any>;
};

type ConditionalBlockFilterNodeResult = {
  condition: Brackets | NotBrackets;
  joins: JoinData[];
  subQueryParameters: SubQueryParameters[];
};

type CompoundFilterNodeResult =
  | ConditionalBlockFilterNodeResult
  | {
      condition: string;
      subQueryParameters: SubQueryParameters[];
    }
  | null;

type SubQueryFilterNodeResult<Entity> = {
  qb: SelectQueryBuilder<Entity>;
  subQueryParameters: SubQueryParameters[];
};

type TargetFilterNodeResult<Entity> = {
  qb: SelectQueryBuilder<Entity>;
};

abstract class FilterNode<T, U> {
  protected filter: U;

  protected conditionPrefix: string;

  protected dataSource: DataSource;

  constructor(conditionPrefix: string, filter: U, dataSource: DataSource) {
    this.conditionPrefix = conditionPrefix;

    this.filter = filter;

    this.dataSource = dataSource;
  }

  abstract resolve(): T;
}

abstract class AttributeFilterNode<
  T,
  U extends { attribute: string },
> extends FilterNode<T, U> {
  protected parent: string | null;

  protected property: string;

  constructor(conditionPrefix: string, filter: U, dataSource: DataSource) {
    super(conditionPrefix, filter, dataSource);

    this.parent = this.getParent();

    this.property = this.getProperty();
  }

  private getParts(): string[] {
    return this.filter.attribute.split('.');
  }

  getParent(): string | null {
    const parts = this.getParts();

    return parts.length > 1 ? parts[parts.length - 2] : null;
  }

  getProperty(): string {
    const parts = this.getParts();

    return parts[parts.length - 1];
  }
}

class FilterNodeFactory extends FilterNode<
  | PrimitiveFilterNodeResult
  | ConditionalBlockFilterNodeResult
  | CompoundFilterNodeResult,
  CompoundFilter | PrimitiveFilter | ConditionalBlockFilter
> {
  private node:
    | PrimitiveFilterNode
    | ConditionalBlockFilterNode
    | CompoundFilterNode
    | null;

  constructor(
    conditionPrefix: string,

    filter: CompoundFilter | PrimitiveFilter | ConditionalBlockFilter,

    dataSource: DataSource,
  ) {
    super(conditionPrefix, filter, dataSource);

    if ('operator' in filter && 'value' in filter) {
      this.node = new PrimitiveFilterNode(conditionPrefix, filter, dataSource);
    } else if ('conditions' in filter) {
      this.node = new ConditionalBlockFilterNode(
        conditionPrefix,

        filter,

        dataSource,
      );
    } else if ('filters' in filter) {
      this.node = new CompoundFilterNode(conditionPrefix, filter, dataSource);
    }
  }

  resolve() {
    if (!this.node) {
      return null;
    }

    return this.node.resolve();
  }
}

class PrimitiveFilterNode extends AttributeFilterNode<
  {
    condition: string;

    valueAliasMap: Record<string, any>;
  },
  PrimitiveFilter
> {
  private valueAlias: string;

  constructor(
    conditionPrefix: string,

    filter: PrimitiveFilter,

    dataSource: DataSource,
  ) {
    super(conditionPrefix, filter, dataSource);

    this.valueAlias = `${this.conditionPrefix}_${this.property}`;
  }

  private getNullCondition(): string {
    if (this.filter.value) {
      return `${this.parent}.${this.property} IS NULL`;
    } else {
      return `${this.parent}.${this.property} IS NOT NULL`;
    }
  }

  private getAliasValue(): string {
    if (this.filter.operator.includes('STARTS_WITH')) {
      return `${this.filter.value}%`;
    }

    if (this.filter.operator.includes('ENDS_WITH')) {
      return `%${this.filter.value}`;
    }

    if (this.filter.operator.includes('CONTAINS')) {
      return `%${this.filter.value}%`;
    }

    return this.filter.value;
  }

  protected getCondition(): string {
    let condition: string;

    const path = `${this.parent}.${this.property}`;

    if (this.filter.operator === PrimitiveFilterOperator.IS_NULL) {
      condition = this.getNullCondition();
    } else if (this.filter.operator === PrimitiveFilterOperator.IN) {
      condition = `${path} IN (:${this.valueAlias})`;
    } else {
      condition = `${path} ${filterNodeOperatorMap[this.filter.operator]} :${this.valueAlias}`;
    }

    if (this.filter.is_negated) {
      condition = `NOT (${condition})`;
    }

    return condition;
  }

  resolve() {
    return {
      condition: this.getCondition(),

      valueAliasMap: {
        [this.valueAlias]: this.getAliasValue(),
      },
    };
  }
}

class ConditionalBlockFilterNode extends FilterNode<
  ConditionalBlockFilterNodeResult,
  ConditionalBlockFilter
> {
  resolve() {
    const method: keyof WhereExpressionBuilder =
      this.filter.conditional_operator === ConditionalOperator.AND
        ? 'andWhere'
        : 'orWhere';

    const BracketsClass = this.filter.is_negated ? NotBrackets : Brackets;

    const joins: JoinData[] = [];

    const subQueryParameters: SubQueryParameters[] = [];

    const condition = new BracketsClass((qb) => {
      this.filter.conditions.forEach((condition, index) => {
        const conditionNode = new FilterNodeFactory(
          `${this.conditionPrefix}_${index}`,

          condition,

          this.dataSource,
        );

        const conditionMethod = index === 0 ? 'where' : method;

        const resolvedCondition = conditionNode.resolve();

        if (resolvedCondition) {
          if (
            'condition' in resolvedCondition &&
            'valueAliasMap' in resolvedCondition
          ) {
            qb = qb[conditionMethod](
              resolvedCondition.condition,

              resolvedCondition.valueAliasMap,
            );
          } else {
            if (resolvedCondition.joins) {
              joins.push(...resolvedCondition.joins);
            }

            if (resolvedCondition.subQueryParameters) {
              subQueryParameters.push(...resolvedCondition.subQueryParameters);
            }

            if (typeof resolvedCondition.condition === 'string') {
              qb = qb[conditionMethod](resolvedCondition.condition);
            } else {
              qb = qb[conditionMethod](resolvedCondition.condition);
            }
          }
        }
      });
    });

    return {
      condition,

      joins,

      subQueryParameters,
    };
  }
}

class CompoundFilterNode extends AttributeFilterNode<
  CompoundFilterNodeResult,
  CompoundFilter
> {
  private relationMetadata: RelationMetadata;

  private columnMetadata: ColumnMetadata;

  constructor(
    conditionPrefix: string,

    filter: CompoundFilter,

    dataSource: DataSource,
  ) {
    super(conditionPrefix, filter, dataSource);

    this.relationMetadata = getRelationMetadata(
      this.parent,

      this.property,

      this.dataSource,
    );

    this.columnMetadata = getColumnMetadata(
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
    // If relation is many to one or one to one, then we can perform join and add conditions

    if (!this.hasMany) {
      const conditionNode = new ConditionalBlockFilterNode(
        `${this.conditionPrefix}_${this.property}`,

        this.filter.filters,

        this.dataSource,
      ).resolve();

      return {
        condition: conditionNode.condition,

        joins: [
          ...conditionNode.joins,

          {
            entity: this.relationMetadata.joinTableName,

            alias: this.property,

            on: `${this.parent}.${getSourceJoinColumn(this.columnMetadata)} = ${this.property}.${getTargetJoinColumn(this.columnMetadata)}`,
          },
        ],

        subQueryParameters: conditionNode.subQueryParameters,
      };
    }

    // If relation is one to many, then we need to use subqueries.

    // F.e. we have table of authors and books. We want to filter authors that have fiction book and biography book.

    // We can't perform simple join, because condition (books.type = 'fiction' AND books.type = 'biography') will result in no rows.

    // With subqueries it will result into (author_id IN (SELECT id FROM books WHERE type = 'fiction') AND author_id IN (SELECT id FROM books WHERE type = 'biography')),

    // which is correct.

    if (this.relationMetadata.isOneToMany) {
      const qb = this.dataSource

        .createQueryBuilder(this.relationMetadata.target, this.property)

        .select(`${this.property}.${getTargetJoinColumn(this.columnMetadata)}`);

      const resolvedSubQuery = new SubQueryFilterNode(
        `${this.conditionPrefix}_${this.property}`,

        this.filter,

        this.dataSource,

        qb,
      ).resolve();

      return {
        condition: `${this.parent}.${getSourceJoinColumn(this.columnMetadata)} IN (${resolvedSubQuery.qb.getQuery()})`,

        subQueryParameters: [
          ...resolvedSubQuery.subQueryParameters,

          resolvedSubQuery.qb.getParameters(),
        ],
      };
    }

    // TODO: add support for many-to-many relations

    return null;
  }
}

class SubQueryFilterNode<Entity> extends AttributeFilterNode<
  SubQueryFilterNodeResult<Entity>,
  CompoundFilter
> {
  private qb: SelectQueryBuilder<Entity>;

  constructor(
    conditionPrefix: string,

    filter: CompoundFilter,

    dataSource: DataSource,

    qb: SelectQueryBuilder<Entity>,
  ) {
    super(conditionPrefix, filter, dataSource);

    this.qb = qb;
  }

  resolve() {
    const resolvedFilter = new ConditionalBlockFilterNode(
      `${this.conditionPrefix}_${this.property}`,

      this.filter.filters,

      this.dataSource,
    ).resolve();

    const joinsArr: JoinData[] = [];

    for (const join of resolvedFilter.joins) {
      if (
        joinsArr.find(
          (j) =>
            j.alias === join.alias &&
            j.entity === join.entity &&
            j.on === join.on,
        )
      ) {
        continue;
      }

      this.qb = this.qb.leftJoin(join.entity, join.alias, join.on);

      joinsArr.push(join);
    }

    this.qb = this.qb.where(resolvedFilter.condition);

    return {
      qb: this.qb,

      subQueryParameters: resolvedFilter.subQueryParameters,
    };
  }
}

class TargetFilterNode<Entity> extends AttributeFilterNode<
  TargetFilterNodeResult<Entity>,
  CompoundFilter
> {
  private qb: SelectQueryBuilder<Entity>;

  constructor(
    conditionPrefix: string,

    filter: CompoundFilter,

    dataSource: DataSource,

    qb: SelectQueryBuilder<Entity>,
  ) {
    super(conditionPrefix, filter, dataSource);

    this.qb = qb;
  }

  resolve() {
    const resolvedFilter = new ConditionalBlockFilterNode(
      `${this.conditionPrefix}_${this.property}`,

      this.filter.filters,

      this.dataSource,
    ).resolve();

    const joinsArr: JoinData[] = [];

    for (const join of resolvedFilter.joins) {
      if (
        joinsArr.find(
          (j) =>
            j.alias === join.alias &&
            j.entity === join.entity &&
            j.on === join.on,
        )
      ) {
        continue;
      }

      this.qb = this.qb.leftJoin(join.entity, join.alias, join.on);

      joinsArr.push(join);
    }

    for (const parameters of resolvedFilter.subQueryParameters) {
      this.qb = this.qb.setParameters(parameters);
    }

    this.qb = this.qb.where(resolvedFilter.condition);

    return { qb: this.qb };
  }
}
