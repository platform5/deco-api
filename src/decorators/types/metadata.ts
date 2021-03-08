import { TypeDecorator } from './type-decorator';
import { UpdateQuery } from './../../helpers/update-query';
let debug = require('debug')('deco-api:decorators:types:metadata');

export interface Metadata {
  key: string;
  value: any;
  type?: string;
}

export let inputMetadata = (value: any, options: any) => {
  if (value === 'null') value = undefined;
  if (value === 'undefined') value = undefined;
  if (value === null) value = undefined;
  return value;
};
export let validateMetadata = (value: any, options: any) => {
  if (value === null) return true;
  if (value === undefined) return true;
  if (value === 'null') return true;
  if (!Array.isArray(value)) return false;

  let allowedKeys = ['key', 'value', 'type'];
  for (let data of value) {
    if (typeof data !== 'object') return false;
    let keys = Object.keys(data);
    for (let key of keys) {
      if (allowedKeys.indexOf(key) === -1) return false;
    }
    if (data.key === undefined) return false;
    if (data.value === undefined) return false;
  }

  return true;
}
export let metadataDecorator = new TypeDecorator('metadata');
metadataDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputMetadata(value, options));
};
metadataDecorator.validate = (value: any, obj: any, options: any) => {
  return validateMetadata(value, options);
};
metadataDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (value === null || value === undefined || value === 'null') {
    updateQuery.unset(key, '');
  } else {
    updateQuery.set(key, value);
  }
  return Promise.resolve();
}
export const metadata = metadataDecorator.decorator();