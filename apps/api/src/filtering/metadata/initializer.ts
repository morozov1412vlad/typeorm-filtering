import { DataSource } from 'typeorm';
import { filterMetadataStorage, EntityFilterMetadata } from './FilterMetadata';
import { ClassConstructor } from 'class-transformer';

export function initializeFilterMetadata(
  filterClasses: ClassConstructor<any>[],
  dataSource: DataSource,
): void {
  //   --- Post-processing: Validate and link metadata ---
  //   Iterate through all collected metadata to perform cross-checks
  //   and ensure consistency, especially for relations.
  for (const metadata of filterMetadataStorage[
    'filterClassToMetadataMap'
  ].values()) {
    // 1. Verify entityConstructor is set
    if (!metadata.entityConstructor) {
      console.error(
        `[FilterMetadata] Filter class ${metadata.filterClassConstructor.name} is decorated with @FilterEntity but no TypeORM entity constructor was provided.`,
      );
      throw new Error(
        `[FilterMetadata] Filter class ${metadata.filterClassConstructor.name} is decorated with @FilterEntity but no TypeORM entity constructor was provided.`,
      );
    }

    

    // // 2. Verify relation filter classes are also @FilterEntity decorated
    // for (const [relationName, nestedFilterClass] of metadata.relationFilters.entries()) {
    //   const nestedMetadata = filterMetadataStorage.getMetadataForFilterClass(nestedFilterClass);
    //   if (!nestedMetadata || !nestedMetadata.entityConstructor) {
    //     console.warn(
    //       `[FilterMetadata] Relation '${relationName}' in ${metadata.filterClassConstructor.name} ` +
    //       `references filter class ${nestedFilterClass.name}, but it's not a valid @FilterEntity ` +
    //       `or its associated entity is missing. Ensure ${nestedFilterClass.name} is correctly decorated.`
    //     );
    //     // Optionally, you might throw an error here depending on strictness
    //   } else {
    //     // Optional: You could add a check here to ensure the relationName actually exists on the entityConstructor
    //     // and that its type matches the nestedMetadata.entityConstructor.
    //     // This requires TypeORM's metadata API.
    //     // E.g., const relation = dataSource.getMetadata(metadata.entityConstructor).relations.find(r => r.propertyName === relationName);
    //     // if (relation && relation.type !== nestedMetadata.entityConstructor) { ... }
    //   }
    // }
  }
}
