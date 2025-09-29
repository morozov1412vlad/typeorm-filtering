import { DataSource } from 'typeorm';
import {
  CompoundFilter,
  PrimitiveFilter,
  ConditionalBlockFilter,
} from '../filter.types';
import {
  PrimitiveFilterNodeResult,
  ConditionalBlockFilterNodeResult,
  CompoundFilterNodeResult,
} from './types';
import { PrimitiveFilterNode } from './primitive_node';
import { ConditionalBlockFilterNode } from './conditional_block_node';
import { CompoundFilterNode } from './compound_node';
import { FilterNode } from './base';

export class FilterNodeFactory extends FilterNode<
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
    super(conditionPrefix, filter, dataSource, parentAlias, parentTableName);
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
        parentTableName,
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
