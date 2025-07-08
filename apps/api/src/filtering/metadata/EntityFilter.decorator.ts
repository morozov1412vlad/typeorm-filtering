import { ObjectLiteral } from 'typeorm';
import { EntityFilterConfig, filterMetadataStorage } from './FilterMetadata';
import { ClassConstructor } from 'class-transformer';

export function FilterProperty(config: any) {
  return function (target: Object, propertyName: string) {
    // 'target' here is the prototype of the FilterEntity class
    const prtotype = target.constructor.prototype
    prtotype[propertyName] = {}
    const filterClassConstructor = target.constructor as ClassConstructor<any>;
    
  };
}

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

    // const prototype = filterClassConstructor.prototype;
    // for (const propertyName of Object.getOwnPropertyNames(prototype)) {
    //   if (propertyName === 'constructor') continue;

    //   const descriptor = Object.getOwnPropertyDescriptor(
    //     prototype,
    //     propertyName,
    //   );

    //   // Check if it's a direct assignment that looks like a nested filter class or property config
    //   if (descriptor && descriptor.value !== undefined) {
    //     const value = descriptor.value;

    //     // Check for nested filter class (e.g., `books = BookFilter`)
    //     // A simple check: if it's a function (class constructor) and has a name
    //     if (typeof value === 'function' && value.name && value.prototype) {
    //       // This is likely a nested FilterEntity class
    //       filterMetadataStorage.registerRelationFilter(
    //         filterClassConstructor,
    //         propertyName,
    //         value,
    //       );
    //     }
    //     // Check for primitive property config (e.g., `first_name = { operators: [...] }`)
    //     else if (
    //       typeof value === 'object' &&
    //       value !== null &&
    //       'operators' in value
    //     ) {
    //       // This is likely a primitive property filter config
    //       filterMetadataStorage.registerPropertyFilter(
    //         filterClassConstructor,
    //         propertyName,
    //         value,
    //       );
    //     }
    //     // Add other checks if you have more direct assignment patterns
    //   }
    // }
  };
}
