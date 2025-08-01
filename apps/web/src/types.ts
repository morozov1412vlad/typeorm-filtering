export interface ObjectLiteral {
  [key: string]: any;
}

type AbstractConstructorHelper<T> = (new (...args: any) => {
  [x: string]: any;
}) &
  T;

export type AbstractContructorParameters<T> = ConstructorParameters<
  AbstractConstructorHelper<T>
>;

export type NonAbstract<T> = new (
  ...args: AbstractContructorParameters<T>
) => T extends abstract new (...args: any) => any ? InstanceType<T> : any;
