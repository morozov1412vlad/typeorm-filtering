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

type CompoundFilterNodeResult = ConditionalBlockFilterNodeResult | null;

// type AggregationFilterNodeResult = {
//   condition: string;
//   subQueryParameters: SubQueryParameters[];
// };

type TargetFilterNodeResult<Entity> = {
  qb: SelectQueryBuilder<Entity>;
};

abstract class FilterNode<T, U> {
  protected filter: U;
  protected conditionPrefix: string;
  protected dataSource: DataSource;
  protected parentAlias: string;

  constructor(
    conditionPrefix: string,
    filter: U,
    dataSource: DataSource,
    parentAlias?: string,
  ) {
    this.conditionPrefix = conditionPrefix;
    this.filter = filter;
    this.dataSource = dataSource;
    this.parentAlias = parentAlias || '';
  }

  abstract resolve(): T;
}

abstract class AttributeFilterNode<
  T,
  U extends { attribute: string },
> extends FilterNode<T, U> {
  protected parent: string | null;
  protected property: string;

  constructor(
    conditionPrefix: string,
    filter: U,
    dataSource: DataSource,
    parentAlias?: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias);
    this.property = this.getProperty();
    this.parent = this.getParent();
  }

  getParent(): string {
    const parts = this.filter.attribute.split('.');
    return parts[parts.length - 2] || null;
  }

  getProperty(): string {
    const parts = this.filter.attribute.split('.');
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
    parentAlias: string,
    parentCompoundFilterPath: string,
    parentTableName: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias);
    if ('operator' in filter && 'value' in filter) {
      this.node = new PrimitiveFilterNode(
        conditionPrefix,
        filter,
        dataSource,
        parentAlias,
      );
    } else if ('conditions' in filter) {
      this.node = new ConditionalBlockFilterNode(
        conditionPrefix,
        filter,
        dataSource,
        parentAlias,
        parentCompoundFilterPath,
        parentTableName,
      );
    } else if ('filters' in filter) {
      this.node = new CompoundFilterNode(
        conditionPrefix,
        filter,
        dataSource,
        parentAlias,
      );
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
    parentAlias: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias);
    this.valueAlias = `${this.conditionPrefix}_${this.property}`;
  }

  private getNullCondition(): string {
    if (this.filter.value) {
      return `${this.parentAlias}.${this.property} IS NULL`;
    } else {
      return `${this.parentAlias}.${this.property} IS NOT NULL`;
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
    const path = `${this.parentAlias}.${this.property}`;

    if (this.filter.operator === PrimitiveFilterOperator.IS_NULL) {
      condition = this.getNullCondition();
    } else if (this.filter.operator === PrimitiveFilterOperator.IN) {
      condition = `${path} IN (:...${this.valueAlias})`;
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
  private parentCompoundFilterPath: string;
  private parentTableName: string;

  constructor(
    conditionPrefix: string,
    filter: ConditionalBlockFilter,
    dataSource: DataSource,
    parentAlias: string,
    parentCompoundFilterPath: string,
    parentTableName: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias);
    this.parentCompoundFilterPath = parentCompoundFilterPath;
    this.parentTableName = parentTableName;
  }

  resolve() {
    const method: keyof WhereExpressionBuilder =
      this.filter.conditional_operator === ConditionalOperator.AND
        ? 'andWhere'
        : 'orWhere';

    const BracketsClass = this.filter.is_negated ? NotBrackets : Brackets;

    const subQueryParameters: SubQueryParameters[] = [];
    const joins: JoinData[] = [];
    const conditionsArr: (
      | string
      | { condition: string; valueAliasMap: Record<string, any> }
      | Brackets
      | NotBrackets
    )[] = [];

    for (const [index, condition] of this.filter.conditions.entries()) {
      const conditionNode = new FilterNodeFactory(
        `${this.conditionPrefix}_${index}`,
        condition,
        this.dataSource,
        this.parentAlias,
        this.parentCompoundFilterPath,
        this.parentTableName,
      );

      const resolvedCondition = conditionNode.resolve();

      if (resolvedCondition) {
        if (
          'condition' in resolvedCondition &&
          'valueAliasMap' in resolvedCondition
        ) {
          conditionsArr.push(resolvedCondition);
        } else {
          if ('joins' in resolvedCondition) {
            joins.push(...resolvedCondition.joins);
          }
          if ('subQueryParameters' in resolvedCondition) {
            subQueryParameters.push(...resolvedCondition.subQueryParameters);
          }
          conditionsArr.push(resolvedCondition.condition);
        }
      }
    }

    const condition = new BracketsClass((qb) => {
      conditionsArr.forEach((condition, index) => {
        const conditionMethod = index === 0 ? 'where' : method;

        if (typeof condition === 'string') {
          qb = qb[conditionMethod](condition);
        } else if ('condition' in condition && 'valueAliasMap' in condition) {
          qb = qb[conditionMethod](
            condition.condition,
            condition.valueAliasMap,
          );
        } else {
          qb = qb[conditionMethod](condition);
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

  constructor(
    conditionPrefix: string,
    filter: CompoundFilter,
    dataSource: DataSource,
    parentAlias: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias);
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
        this.parent,
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

// class SubQueryFilterNode<Entity> extends AttributeFilterNode<
//   SubQueryFilterNodeResult<Entity>,
//   CompoundFilter
// > {
//   private qb: SelectQueryBuilder<Entity>;
//   constructor(
//     conditionPrefix: string,
//     filter: CompoundFilter,
//     dataSource: DataSource,
//     qb: SelectQueryBuilder<Entity>,
//     parentAlias: string,
//   ) {
//     super(conditionPrefix, filter, dataSource, parentAlias);
//     this.qb = qb;
//   }

//   resolve() {
//     const resolvedFilter = new ConditionalBlockFilterNode(
//       `${this.conditionPrefix}_${this.property}`,
//       this.filter.filters,
//       this.dataSource,
//       this.parentAlias,
//     ).resolve();

//     const joinsArr: JoinData[] = [];

//     for (const join of resolvedFilter.joins) {
//       if (
//         joinsArr.find(
//           (j) =>
//             j.alias === join.alias &&
//             j.entity === join.entity &&
//             j.on === join.on,
//         )
//       ) {
//         continue;
//       }
//       this.qb = this.qb.leftJoin(join.entity, join.alias, join.on);
//       joinsArr.push(join);
//     }

//     this.qb = this.qb.where(resolvedFilter.condition);

//     return {
//       qb: this.qb,
//       subQueryParameters: resolvedFilter.subQueryParameters,
//     };
//   }
// }

// // Aggregation node filtering logic:
// // 1. Get first property name from attribute after parent attribute path (it must point to another table).
// // 2. Get relation data between parent table and table that property points to.
// // 3. The resulting condition will use subquery and will look like this:
// //    parentAlias.parent_join_column IN (
// //      SELECT property_table_alias.property_column
// //      FROM property_table property_table_alias
// //      ... addtional joins from nested conditions and rest of the attribute path ...
// //      WHERE (... nested conditions ...)
// //      GROUP BY property_table_alias.property_column
// //      HAVING (... aggregation condition ...)
// //    )
// //
// // If aggregation function is COUNT, then last attribute path part can reffer to table, without any further column.
// // Otherwise, last attribute path part must reffer to column of the table, that is the target of the relation.
// //
// // In general, it's possible for aggregation to be based on other aggregation
// // (let's say MAX review score from AVG scores of all books of the author).
// // But it is not supported yet. In order to support it, we need to treat AVG book score as a separate entity.
// // But currently contract doesn't support it.
// class AggregationFilterNode extends AttributeFilterNode<
//   AggregationFilterNodeResult,
//   AggregationFilter
// > {
//   private parentCompoundFilterPath: string;
//   private parentTableName: string;

//   constructor(
//     conditionPrefix: string,
//     filter: AggregationFilter,
//     dataSource: DataSource,
//     parentAlias: string,
//     parentCompoundFilterPath: string,
//     parentTableName: string,
//   ) {
//     super(conditionPrefix, filter, dataSource, parentAlias);
//     this.parentCompoundFilterPath = parentCompoundFilterPath;
//     this.parentTableName = parentTableName;
//   }

//   private getFirstPropertyName(parentPath: string, currentPath: string) {
//     const parentPathParts = parentPath.split('.');
//     const currentPathParts = currentPath.split('.');
//     const propertyName = currentPathParts[parentPathParts.length];
//     if (!propertyName) {
//       return null;
//     }
//     return propertyName;
//   }

//   resolve() {
//     return {
//       condition: '',
//       subQueryParameters: [],
//     };
//   }
// }

export class TargetFilterNode<Entity> extends AttributeFilterNode<
  TargetFilterNodeResult<Entity>,
  CompoundFilter
> {
  private qb: SelectQueryBuilder<Entity>;
  private tableAlias: string;

  constructor(
    conditionPrefix: string,
    filter: CompoundFilter,
    dataSource: DataSource,
    qb: SelectQueryBuilder<Entity>,
    alias: string,
  ) {
    super(conditionPrefix, filter, dataSource);
    this.tableAlias = alias;
    this.qb = qb;
  }

  resolve() {
    const resolvedFilter = new ConditionalBlockFilterNode(
      this.tableAlias,
      this.filter.filters,
      this.dataSource,
      this.tableAlias,
      this.filter.attribute,
      this.filter.attribute,
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

    return { qb: this.qb };
  }
}
