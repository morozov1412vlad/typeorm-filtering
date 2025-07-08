export enum ConditionalOperator {
  AND = 'AND',
  OR = 'OR',
}

export enum NullableOperator {
  IS_NULL = 'IS_NULL',
}

export enum StringOperator {
  IS = 'IS',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
}

export enum NumberOperator {
  IS = 'IS',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
}

export enum BooleanOperator {
  IS = 'IS',
}

export enum DateOperator {
  IS = 'IS',
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  ON_OR_BEFORE = 'ON_OR_BEFORE',
  ON_OR_AFTER = 'ON_OR_AFTER',
}

export enum OneToManyOperator {
  ANY_OF = 'ANY_OF',
  ALL_OF = 'ALL_OF',
  NONE_OF = 'NONE_OF',
}

export type PrimitiveFilterOperator =
  | NullableOperator
  | StringOperator
  | NumberOperator
  | BooleanOperator
  | DateOperator
  | OneToManyOperator;
