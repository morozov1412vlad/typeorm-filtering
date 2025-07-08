import { ClassConstructor } from 'class-transformer';
import { ObjectLiteral } from '../types';

export function LocalState(entity: string) {
  return function (entityClass: ClassConstructor<ObjectLiteral>) {
    // register entity if it's not already registered
    // register entity local state
  };
}

class LocalStateClass<Response> {
  private _responseType?: Response;
}

function FromField<
  TPropName extends string,
  TClassInstance,
  TPropType extends TClassInstance extends { [key in TPropName]: infer R }
    ? R
    : never,
  TResponse extends TClassInstance extends LocalStateClass<infer R> ? R : never,
  TResponsePropName extends keyof TResponse,
  TResponsePropNameValidated extends
    TResponse[TResponsePropName] extends TPropType ? TResponsePropName : never,
>(
  field: TResponsePropNameValidated,
): (target: TClassInstance, propertyName: TPropName) => void;

function FromField<
  TPropName extends string,
  TClassInstance,
  TPropType extends TClassInstance extends { [key in TPropName]: infer R }
    ? R
    : never,
  TResponse extends TClassInstance extends LocalStateClass<infer R> ? R : never,
  TResponsePropName extends keyof TResponse,
  TConverter extends (value: TResponse[TResponsePropName]) => TPropType,
  TResponsePropNameValidated extends ReturnType<TConverter> extends TPropType
    ? TResponsePropName
    : never,
>(
  field: TResponsePropNameValidated,
  converter: TConverter,
): (target: TClassInstance, propertyName: TPropName) => void;

function FromField<
  ActualPropName extends string,
  ActualClassInstance extends LocalStateClass<any>,
>(
  field: string | number | symbol,
  converter?: (value: any) => any,
): (target: ActualClassInstance, propertyName: ActualPropName) => void {
  return function (
    target: ActualClassInstance,
    propertyName: ActualPropName,
  ) {};
}

export function Property<T>(config: () => T) {
  return function <
    Prop extends string,
    ClassInstance extends { [key in Prop]: T },
  >(target: ClassInstance, propertyName: Prop) {};
}

class MyResponse {
  id: string;
  name: string;
}

class My extends LocalStateClass<MyResponse> {
  @Property(() => 12)
  test: number;

  @FromField('id')
  id: string;

  @FromField('name')
  myName: string;

  @FromField('id', (value) => value.length)
  myName2: number;
}
