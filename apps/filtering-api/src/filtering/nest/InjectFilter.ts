import { Inject } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';

export function getFilterServiceToken(filterClass: ClassConstructor<any>): string {
  return `FilterService_${filterClass.name}`;
}

export function InjectFilter(filterClass: ClassConstructor<any>) {
  return Inject(getFilterServiceToken(filterClass));
}