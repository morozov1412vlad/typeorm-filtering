export enum NullableOperator {
  IS_NULL = 'IS_NULL',
}

export enum StringOperator {
  IS = 'IS',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS_CASE_SENSITIVE = 'CONTAINS_CASE_SENSITIVE',
  STARTS_WITH_CASE_SENSITIVE = 'STARTS_WITH_CASE_SENSITIVE',
  ENDS_WITH_CASE_SENSITIVE = 'ENDS_WITH_CASE_SENSITIVE',
}

export enum NumberOperator {
  IS = 'IS',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  BETWEEN = 'BETWEEN',
  BETWEEN_OR_EQUAL = 'BETWEEN_OR_EQUAL',
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
  BETWEEN = 'BETWEEN',
  ON_OR_BETWEEN = 'ON_OR_BETWEEN',
}

export enum OneToManyOperator {
  ANY_OF = 'ANY_OF',
  ALL_OF = 'ALL_OF',
  NONE_OF = 'NONE_OF',
}

export enum PrimitiveFilterOperator {
  IS_NULL = 'IS_NULL',
  IS = 'IS',
  CONTAINS = 'CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  CONTAINS_CASE_SENSITIVE = 'CONTAINS_CASE_SENSITIVE',
  STARTS_WITH_CASE_SENSITIVE = 'STARTS_WITH_CASE_SENSITIVE',
  ENDS_WITH_CASE_SENSITIVE = 'ENDS_WITH_CASE_SENSITIVE',
  LESS_THAN = 'LESS_THAN',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL',
  GREATER_THAN = 'GREATER_THAN',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  BEFORE = 'BEFORE',
  AFTER = 'AFTER',
  ON_OR_BEFORE = 'ON_OR_BEFORE',
  ON_OR_AFTER = 'ON_OR_AFTER',
  IN = 'IN',
}

export const filterNodeOperatorMap: Record<PrimitiveFilterOperator, string> = {
  [PrimitiveFilterOperator.IS_NULL]: 'IS NULL',
  [PrimitiveFilterOperator.IS]: '=',
  [PrimitiveFilterOperator.CONTAINS]: 'ILIKE',
  [PrimitiveFilterOperator.STARTS_WITH]: 'ILIKE',
  [PrimitiveFilterOperator.ENDS_WITH]: 'ILIKE',
  [PrimitiveFilterOperator.CONTAINS_CASE_SENSITIVE]: 'LIKE',
  [PrimitiveFilterOperator.STARTS_WITH_CASE_SENSITIVE]: 'LIKE',
  [PrimitiveFilterOperator.ENDS_WITH_CASE_SENSITIVE]: 'LIKE',
  [PrimitiveFilterOperator.LESS_THAN]: '<',
  [PrimitiveFilterOperator.LESS_THAN_OR_EQUAL]: '<=',
  [PrimitiveFilterOperator.GREATER_THAN]: '>',
  [PrimitiveFilterOperator.GREATER_THAN_OR_EQUAL]: '>=',
  [PrimitiveFilterOperator.BEFORE]: '<',
  [PrimitiveFilterOperator.AFTER]: '>',
  [PrimitiveFilterOperator.ON_OR_BEFORE]: '<=',
  [PrimitiveFilterOperator.ON_OR_AFTER]: '>=',
  [PrimitiveFilterOperator.IN]: 'IN',
};
