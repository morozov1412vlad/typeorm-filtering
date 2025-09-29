import { ObjectLiteral } from 'typeorm';
import { EntityFilterConfig, filterMetadataStorage } from './FilterMetadata';
import { ClassConstructor } from 'class-transformer';

export function EntityFilter<T extends ObjectLiteral>(
  entityConstructor: ClassConstructor<T>,
  config?: EntityFilterConfig<T>,
) {
  return function (filterClassConstructor: ClassConstructor<any>) {
    filterMetadataStorage.getOrCreateEntityFilterMetadata(
      entityConstructor,
      (config || {}) as any as EntityFilterConfig<ObjectLiteral>,
      filterClassConstructor,
    );
  };
}
