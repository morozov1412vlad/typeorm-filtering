import { PrimitiveFilterOperator } from './operator.types';

export enum ConditionalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum AggregationFunction {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
}

type NegatedWrapper<T extends Object> = { is_negated?: boolean } & T;

export type ConditionalWrapper<T> = NegatedWrapper<{
  conditional_operator: ConditionalOperator;
  conditions: (ConditionalWrapper<T> | T)[];
}>;

export type PrimitiveFilter = NegatedWrapper<{
  attribute: string;
  operator: PrimitiveFilterOperator;
  value: any;
}>;

// export type AggregationFilter = NegatedWrapper<{
//   attribute: string;
//   function: AggregationFunction;
//   operator: Extract<PrimitiveFilterOperator, 'IS' | 'GT' | 'GTE' | 'LT' | 'LTE'>;
//   value: number;
//   nested_filter: CompoundFilter;
// }>;

export type CompoundFilter = {
  attribute: string;
  filters: ConditionalBlockFilter;
};

export type ConditionalBlockFilter = ConditionalWrapper<
  PrimitiveFilter | CompoundFilter
>;
