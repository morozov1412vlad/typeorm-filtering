import {
  Brackets,
  NotBrackets,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

export interface JoinData {
  entity: string;
  alias: string;
  on: string;
}

export type SubQueryParameters = ObjectLiteral;

export type PrimitiveFilterNodeResult = {
  condition: string;
  valueAliasMap: ObjectLiteral;
};

export type ConditionalBlockFilterNodeResult = {
  condition: Brackets | NotBrackets;
  joins: JoinData[];
  subQueryParameters: SubQueryParameters[];
};

export type CompoundFilterNodeResult = ConditionalBlockFilterNodeResult | null;

export type TargetFilterNodeResult<Entity extends ObjectLiteral> = {
  qb: SelectQueryBuilder<Entity>;
};
