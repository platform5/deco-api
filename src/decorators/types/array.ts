import { TypeDecorator } from './type-decorator';
import { inputString, inputBoolean, inputDate, inputFloat, inputInteger } from './basics';
import { validateString, validateInteger, validateFloat, validateBoolean, validateDate } from './basics';
import { inputObject, validateObject } from './object';
let debug = require('debug')('deco-api:decorators:types:array');

export let arrayDecorator = new TypeDecorator('array');
export let inputArray = (value: any, options: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (typeof value === 'string') {
    try {
      let testJsonParse = JSON.parse(value);
      if (Array.isArray(testJsonParse)) value = testJsonParse;
      else throw new Error('fake error to go to catch block');
    } catch (e) {
      value = value.split(',').map((item: any) => item.trim());
    }
  } 
  if (!Array.isArray(value)) return value;
  if (options && options.type) {
    let newValue = value.map(item => item);
    for (let index in value) {
      if (options.type === 'string') newValue[index] = (inputString(value[index]));
      if (options.type === 'integer') newValue[index] = inputInteger(value[index]);
      if (options.type === 'float') newValue[index] = inputFloat(value[index]);
      if (options.type === 'boolean') newValue[index] = inputBoolean(value[index]);
      if (options.type === 'date') newValue[index] = inputDate(value[index]);
      if (options.type === 'object' && options.options) newValue[index] = inputObject(value[index], options.options);
    }
    value = newValue;
  }
  return value;
}
arrayDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputArray(value, options));
};
export let validateArray = async (value: any, options: any) => {
  if (value === null || value === undefined) return true;
  if (!Array.isArray(value)) return false;

  if (options && options.type) {
    for (let item of value) {
      if (options.type === 'string' && !validateString(item)) return false;
      if (options.type === 'integer' && !validateInteger(item)) return false;
      if (options.type === 'float' && !validateFloat(item)) return false;
      if (options.type === 'boolean' && !validateBoolean(item)) return false;
      if (options.type === 'date' && !validateDate(item)) return false;
      if (options.type === 'object' && options.options && !await validateObject(item, options.options)) return false;
    }
  }
  return true;
};
arrayDecorator.validate = (value: any, obj: any, options: any) => {
  return validateArray(value, options);
};
export const array = arrayDecorator.decorator();