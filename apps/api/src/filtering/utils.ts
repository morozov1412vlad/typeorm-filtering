import { DataSource, EntityTarget } from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

export function getEntityByTableName<T extends string>(
  tableName: T,
  dataSource: DataSource,
): EntityTarget<T> {
  const target = dataSource.getMetadata(tableName).target;
  if (!target) {
    throw new Error(`Table ${tableName} not found in data source`);
  }
  return target;
}

export function getColumnMetadata(
  tableName: string,
  propertyName: string,
  dataSource: DataSource,
): ColumnMetadata {
  return dataSource
    .getMetadata(tableName)
    .columns.find((c) => c.propertyName === propertyName);
}

export function getRelationMetadata(
  tableName: string,
  propertyName: string,
  dataSource: DataSource,
): RelationMetadata {
  const relationMetadata = dataSource.getMetadata(tableName).relations.find(
    (r) => r.propertyName === propertyName,
  );
  if (!relationMetadata) {
    throw new Error(`Relation ${propertyName} not found in table ${tableName}`);
  }
  return relationMetadata;
}

export function getSourceJoinColumn(columnMeta: ColumnMetadata): string {
  return columnMeta.databaseName;
}

export function getTargetJoinColumn(columnMeta: ColumnMetadata): string {
  return columnMeta.databasePath.split('.')[1];
}
