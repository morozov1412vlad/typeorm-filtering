import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { ClassConstructor } from 'class-transformer';

export interface EntityFilterConfig<T extends ObjectLiteral> {
  excludedProperties?: (keyof T)[];
  properties?: (keyof T)[];
  preFiltering?: (
    qb: SelectQueryBuilder<T>,
    alias: string,
    params?: ObjectLiteral,
  ) => SelectQueryBuilder<T>;
}

export class EntityFilterMetadata {
  filterClassConstructor: ClassConstructor<ObjectLiteral>;
  public readonly config: EntityFilterConfig<ObjectLiteral> = {};
  public readonly entityConstructor:
    | ClassConstructor<ObjectLiteral>
    | undefined;
  constructor(
    entityConstructor: ClassConstructor<ObjectLiteral>,
    config: EntityFilterConfig<ObjectLiteral>,
    filterClassConstructor: ClassConstructor<ObjectLiteral>,
  ) {
    this.filterClassConstructor = filterClassConstructor;
    this.entityConstructor = entityConstructor;
    this.config = config;
  }
}

export class FilterMetadataStorage {
  private static instance: FilterMetadataStorage;
  private filterClassToMetadataMap: Map<
    ClassConstructor<ObjectLiteral>,
    EntityFilterMetadata
  > = new Map();

  public static getInstance(): FilterMetadataStorage {
    if (!FilterMetadataStorage.instance) {
      FilterMetadataStorage.instance = new FilterMetadataStorage();
    }
    return FilterMetadataStorage.instance;
  }

  public registerEntityFilter(
    entityConstructor: ClassConstructor<ObjectLiteral>,
    config: EntityFilterConfig<ObjectLiteral>,
    filterClass: ClassConstructor<ObjectLiteral>,
  ): void {
    this.getOrCreateEntityFilterMetadata(
      entityConstructor,
      config,
      filterClass,
    );
  }

  public getOrCreateEntityFilterMetadata(
    entityConstructor: ClassConstructor<ObjectLiteral>,
    config: EntityFilterConfig<ObjectLiteral>,
    filterClass: ClassConstructor<ObjectLiteral>,
  ): EntityFilterMetadata {
    if (!this.filterClassToMetadataMap.has(filterClass)) {
      const metadata = new EntityFilterMetadata(
        entityConstructor,
        config,
        filterClass,
      );
      this.filterClassToMetadataMap.set(filterClass, metadata);
      return metadata;
    }
    return this.filterClassToMetadataMap.get(filterClass)!;
  }

  public getEntityFilterMetadata(
    filterClass: ClassConstructor<any>,
  ): EntityFilterMetadata | undefined {
    return this.filterClassToMetadataMap.get(filterClass);
  }
}

export const filterMetadataStorage = FilterMetadataStorage.getInstance();
