import { ObjectLiteral } from 'typeorm';

import { PrimitiveFilterOperator } from './operator.types';

type Primitive = string | number | boolean | bigint | null | Date;

type Dotless<T extends string> = T extends `${string}.${string}` ? never : T;

type PrimitiveKey<T> = {
  [K in keyof T]: T[K] extends Primitive ? K & string : never;
}[keyof T];

type NestedEntityType<Entity, Key> = Key extends keyof Entity
  ? Entity[Key] extends Array<infer T>
    ? T
    : Entity[Key] extends ObjectLiteral
      ? Entity[Key]
      : never
  : never;

type ExtractLastProperty<Path extends string> =
  Path extends `${string}.${infer Rest}` ? ExtractLastProperty<Rest> : Path;

export enum ConditionalOperator {
  AND = 'AND',
  OR = 'OR',
}

type NegatedWrapper<T extends Object> = { is_negated?: boolean } & T;

export type ConditionalWrapper<T> = NegatedWrapper<{
  conditional_operator: ConditionalOperator;
  conditions: (ConditionalWrapper<T> | T)[];
}>;

export type PrimitiveFilter<Entity, Path extends string> = NegatedWrapper<{
  attribute: `${Path}.${PrimitiveKey<Entity> & string}`;
  operator: PrimitiveFilterOperator;
  value: any;
}>;

export type ConditionalBlockFilter<
  Entity,
  Path extends string,
> = ConditionalWrapper<
  PrimitiveFilter<Entity, Path> | CompoundFilter<Entity, Path>
>;

type CompoundFilter<Entity, Path extends string> = {
  attribute: `${Path}.${Exclude<keyof Entity, PrimitiveKey<Entity>> & string}`;
  filters: ExtractLastProperty<
    CompoundFilter<Entity, Path>['attribute']
  > extends keyof Entity
    ? ConditionalBlockFilter<
        NestedEntityType<
          Entity,
          ExtractLastProperty<CompoundFilter<Entity, Path>['attribute']>
        >,
        CompoundFilter<Entity, Path>['attribute']
      >
    : never;
};

export type EntityFilter<Entity, TableName extends string> =
  Dotless<TableName> extends never
    ? never
    : {
        attribute: TableName;
        filters: ConditionalBlockFilter<Entity, TableName>;
      };
