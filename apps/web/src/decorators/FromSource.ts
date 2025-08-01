import { TransformFrom } from './types';

export function FromSource<
  TPropName extends string,
  TPropType,
  TClassInstance extends { [key in TPropName]: TPropType },
  TResponse extends TClassInstance extends TransformFrom<infer R> ? R : never,
>(
  converter: (data: TResponse) => TPropType | Promise<TPropType>,
): (target: TClassInstance, propertyName: TPropName) => void {
  return function (target: TClassInstance, propertyName: TPropName) {};
}

// TEST
class MyResponse {
  id: string;
  name: string;
  number: number;
}

class My extends TransformFrom<MyResponse> {
  @FromSource(async (data) => data.name)
  id: string;
}
