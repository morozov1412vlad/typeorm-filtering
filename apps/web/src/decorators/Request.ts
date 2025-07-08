import { ClassConstructor } from 'class-transformer';
import { ObjectLiteral } from '../types';

export function Request(entity: string) {
  return function (entityClass: ClassConstructor<ObjectLiteral>) {
    // register entity if it's not already registered
    // register entity request
  };
}