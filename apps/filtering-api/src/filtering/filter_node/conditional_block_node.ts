import {
  DataSource,
  ObjectLiteral,
  NotBrackets,
  Brackets,
  WhereExpressionBuilder,
} from 'typeorm';
import { ConditionalBlockFilter, ConditionalOperator } from '../filter.types';
import { FilterNode } from './base';
import {
  SubQueryParameters,
  JoinData,
  ConditionalBlockFilterNodeResult,
} from './types';
import { FilterNodeFactory } from './node_factory';

export class ConditionalBlockFilterNode extends FilterNode<
  ConditionalBlockFilterNodeResult,
  ConditionalBlockFilter
> {
  private parentCompoundFilterPath: string;

  constructor(
    conditionPrefix: string,
    filter: ConditionalBlockFilter,
    dataSource: DataSource,
    parentAlias: string,
    parentCompoundFilterPath: string,
    parentTableName: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias, parentTableName);
    this.parentCompoundFilterPath = parentCompoundFilterPath;
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
      | { condition: string; valueAliasMap: ObjectLiteral }
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
        this.parentTableName!,
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
