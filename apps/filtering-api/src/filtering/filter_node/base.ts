import { DataSource } from 'typeorm';

export abstract class FilterNode<T, U> {
  protected filter: U;
  protected conditionPrefix: string;
  protected dataSource: DataSource;
  protected parentAlias: string;
  protected parentTableName: string | null;

  constructor(
    conditionPrefix: string,
    filter: U,
    dataSource: DataSource,
    parentAlias?: string,
    parentTableName?: string
  ) {
    this.conditionPrefix = conditionPrefix;
    this.filter = filter;
    this.dataSource = dataSource;
    this.parentAlias = parentAlias || '';
    this.parentTableName = parentTableName || null;
  }

  abstract resolve(): T;
}

export abstract class AttributeFilterNode<
  T,
  U extends { attribute: string },
> extends FilterNode<T, U> {
  protected parent: string | null;
  protected property: string;

  constructor(
    conditionPrefix: string,
    filter: U,
    dataSource: DataSource,
    parentAlias?: string,
    parentTableName?: string,
  ) {
    super(conditionPrefix, filter, dataSource, parentAlias, parentTableName);
    this.property = this.getProperty();
    this.parent = this.getParent();
  }

  getParent(): string | null {
    if (this.parentTableName) {
      return this.parentTableName;
    }
    const parts = this.filter.attribute.split('.');
    return parts[parts.length - 2] || null;
  }

  getProperty(): string {
    const parts = this.filter.attribute.split('.');
    return parts[parts.length - 1];
  }
}
