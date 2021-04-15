import { TypeDecorator } from './type-decorator';
import { inputString, inputBoolean, inputDate, inputFloat, inputInteger } from './basics';
import { validateString, validateInteger, validateFloat, validateBoolean, validateDate } from './basics';
import { inputModel, inputModels, validateModel, validateModels } from './models';
import { inputArray, validateArray } from './array';
import moment from 'moment';
let debug = require('debug')('deco-api:decorators:types:object');

export let inputObject = (value: any, options: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (typeof value === 'string') {
    try {
      let objectValue = JSON.parse(value);
      value = objectValue;
    } catch (error) {
      // do nothing
    }
  }
  if (value !== null && typeof value === 'object' && options && options.keys) {
    let allowOtherKeys = (options.allowOtherKeys === true);
    for (let key of Object.keys(value)) {
      let keySettings = options.keys[key];
      if (!keySettings) continue;

      if (keySettings.type === 'string') value[key] = inputString(value[key]);
      if (keySettings.type === 'integer') value[key] = inputInteger(value[key]);
      if (keySettings.type === 'float') value[key] = inputFloat(value[key]);
      if (keySettings.type === 'boolean') value[key] = inputBoolean(value[key]);
      if (keySettings.type === 'date') value[key] = inputDate(value[key]);
      if (keySettings.type === 'array') value[key] = inputArray(value[key], keySettings.options);
      if (keySettings.type === 'model') value[key] =  inputModel(value[key], keySettings.options, key);
      if (keySettings.type === 'models') value[key] =  inputModels(value[key], keySettings.options, key);
    }
  }
  return value;
};
export let validateObject = async (value: any, options: any) => {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'object') {
    debug('is not an object', value);
    return false;
  }
  if (options && options.keys) {
    let allowOtherKeys = (options.allowOtherKeys === true);

    // validate required fields
    for (let key of Object.keys(options.keys)) {
      let keySettings = options.keys[key];
      if (keySettings.required === true && value[key] === undefined) {
        debug('missing required key', key, '; value: ', value);
      }
    }

    for (let key of Object.keys(value)) {
      let keySettings = options.keys[key];
      if (!keySettings && !allowOtherKeys) {
        debug('other key not allowed', key);
        return false;
      }
      if (!keySettings) continue;
      if (keySettings.type === 'string' && !validateString(value[key])) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'integer' && !validateInteger(value[key])) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'float' && !validateFloat(value[key])) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'boolean' && !validateBoolean(value[key])) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'date' && !validateDate(value[key])) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'array' && !await validateArray(value[key], keySettings.options)) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'model' && !await validateModel(value[key], keySettings.options)) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
      if (keySettings.type === 'models' && !await validateModels(value[key], keySettings.options)) {
        debug('Invalid key', key, '; should be ', keySettings.type, '; is:', value[key]);
        return false;
      };
    }
  }
  return true;
}
export let objectDecorator = new TypeDecorator('object');
objectDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputObject(value, options));
};
objectDecorator.validate = (value: any, obj: any, options: any) => {
  return validateObject(value, options);
};
export const object = objectDecorator.decorator();