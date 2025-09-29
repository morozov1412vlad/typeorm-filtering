import { DataSource, ObjectLiteral } from 'typeorm';
import { PrimitiveFilter } from '../filter.types';
import { AttributeFilterNode } from './base';
import {
  PrimitiveFilterOperator,
  filterNodeOperatorMap,
} from '../operator.types';

export class PrimitiveFilterNode extends AttributeFilterNode<
  {
    condition: string;
    valueAliasMap: ObjectLiteral;
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
