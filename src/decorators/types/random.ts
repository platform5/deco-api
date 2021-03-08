import { UpdateQuery } from './../../helpers/update-query';
import { TypeDecorator } from './type-decorator';
import crypto from 'crypto';
let debug = require('debug')('deco-api:decorators:types:random');

export let randomDecorator = new TypeDecorator('random');
export let inputRandom = (value: any, options: any) => {
  return undefined
}
randomDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputRandom(value, options));
};
export let validateRandom = async (value: any, options: any) => {
  return true;
};
randomDecorator.validate = (value: any, obj: any, options: any) => {
  return validateRandom(value, options);
};
randomDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (element[key]) {
    updateQuery.set(key, value);
    return Promise.resolve();
  } 
  let len = options.nbChars || 8;
  let token = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
  updateQuery.set(key, token);
  return Promise.resolve();
}
export const random = randomDecorator.decorator();