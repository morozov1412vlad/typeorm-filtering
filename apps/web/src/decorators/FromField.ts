import { TransformFrom } from './types';

export function FromField<
  TPropName extends string,
  TClassInstance,
  TPropType extends TClassInstance extends { [key in TPropName]: infer R }
    ? R
    : never,
  TSource extends TClassInstance extends TransformFrom<infer R> ? R : never,
  TSourcePropName extends keyof TSource,
  TSourcePropNameValidated extends TSource[TSourcePropName] extends TPropType
    ? TSourcePropName
    : never,
>(
  field: TSourcePropNameValidated,
): (target: TClassInstance, propertyName: TPropName) => void;

export function FromField<
  TPropName extends string,
  TClassInstance,
  TPropType extends TClassInstance extends { [key in TPropName]: infer R }
    ? R
    : never,
  TSource extends TClassInstance extends TransformFrom<infer R> ? R : never,
  TSourcePropName extends keyof TSource,
  TConverter extends (value: TSource[TSourcePropName]) => TPropType,
  TSourcePropNameValidated extends ReturnType<TConverter> extends TPropType
    ? TSourcePropName
    : never,
>(
  field: TSourcePropNameValidated,
  converter: TConverter,
): (target: TClassInstance, propertyName: TPropName) => void;

export function FromField<
  TPropName extends string,
  TClassInstance,
  TPropType extends TClassInstance extends { [key in TPropName]: infer R }
    ? R
    : never,
  TSource extends TClassInstance extends TransformFrom<infer R> ? R : never,
  TSourcePropName extends keyof TSource,
  TConverter extends (value: TSource[TSourcePropName]) => Promise<TPropType>,
  TSourcePropNameValidated extends Awaited<
    ReturnType<TConverter>
  > extends TPropType
    ? TSourcePropName
    : never,
>(
  field: TSourcePropNameValidated,
  converter: TConverter,
): (target: TClassInstance, propertyName: TPropName) => void;

export function FromField<
  ActualPropName extends string,
  ActualClassInstance extends TransformFrom<any>,
>(
  field: string | number | symbol,
  converter?: (value: any) => any,
): (target: ActualClassInstance, propertyName: ActualPropName) => void {
  return function (
    target: ActualClassInstance,
    propertyName: ActualPropName,
  ) {};
}

// TEST
class MyResponse {
  id: string;
  name: string;
}

class My extends TransformFrom<MyResponse> {
  @FromField('id')
  id: string;

  @FromField('name')
  myName: string;

  @FromField('id', (value) => value.length)
  myName2: number;

  @FromField('id', async (value) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return value + '12';
  })
  myName3: string;
}
