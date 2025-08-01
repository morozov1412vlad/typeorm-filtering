import { IsString } from 'class-validator';
import { ClassConstructor } from 'class-transformer';
import { ObjectLiteral } from './types';

export class A {
  @IsString()
  name: string;
}



export function Inject(entity: string) {
  return function (entityClass: ClassConstructor<ObjectLiteral>) {
    // register entity if it's not already registered
    // register entity local state
  };
}
