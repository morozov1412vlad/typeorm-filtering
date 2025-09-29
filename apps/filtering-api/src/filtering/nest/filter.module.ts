import { DynamicModule, Module, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  initializeFilterMetadata,
  filterMetadataStorage,
  FilterMetadataStorage,
} from './FilterMetadata';
import { FilterService } from './filter.service';
import { getFilterServiceToken } from './InjectFilter';
import { ClassConstructor } from 'class-transformer';

@Module({})
export class FilterModule implements OnModuleInit {
  private readonly logger = new Logger(FilterModule.name);

  constructor(private dataSource: DataSource) {}

  static forRoot(filterClasses: ClassConstructor<any>[]): DynamicModule {
    const metadataStorageProvider = {
      provide: FilterMetadataStorage,
      useValue: filterMetadataStorage,
    };

    const filterServiceProviders = filterClasses.map((filterClass) => {
      return {
        provide: getFilterServiceToken(filterClass),
        useFactory: (
          dataSource: DataSource,
          metadataStorage: FilterMetadataStorage,
        ) => {
          const filterService = new FilterService(dataSource, metadataStorage);
          const metadata = metadataStorage.getEntityFilterMetadata(filterClass);
          if (!metadata || !metadata.entityConstructor) {
            throw new Error(
              `Filter metadata for ${filterClass.name} not found or entity not linked. ` +
                `Ensure @FilterEntity is correctly applied and the entity constructor is provided.`,
            );
          }
          filterService._setContext(metadata.entityConstructor, metadata);
          return filterService;
        },
        inject: [DataSource, FilterMetadataStorage],
      };
    });

    return {
      module: FilterModule,
      providers: [
        FilterService,
        metadataStorageProvider,
        ...filterServiceProviders,
      ],
      exports: [
        FilterService,
        metadataStorageProvider.provide,
        ...filterServiceProviders.map((p) => p.provide),
      ],
      global: true,
    };
  }

  async onModuleInit() {
    // console.log(
    //   'FilterModule onModuleInit: Initializing filter metadata...',
    // );
    const registeredFilterClasses = Array.from(
      filterMetadataStorage['filterClassToMetadataMap'].keys(),
    );
    initializeFilterMetadata();
    this.logger.log('Filter metadata initialization complete.');
  }
}
