import { DataSource, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { CompoundFilter } from '../filter.types';
import { AttributeFilterNode } from './base';
import { TargetFilterNodeResult, JoinData } from './types';
import { ConditionalBlockFilterNode } from './conditional_block_node';

export class TargetFilterNode<Entity extends ObjectLiteral> extends AttributeFilterNode<
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
