import { ClassConstructor } from 'class-transformer';
import { ObjectLiteral } from '../types';

export function LocalState(entity: string) {
  return function (entityClass: ClassConstructor<ObjectLiteral>) {
    // register entity if it's not already registered
    // register entity local state
  };
}

class TransformFrom<Response> {
  private _sourceType?: Response;
}
