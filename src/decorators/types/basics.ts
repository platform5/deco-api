import { TypeDecorator } from './type-decorator';
import moment from 'moment';
import { Settings } from '../../helpers/settings';
import { DateHelper } from '../../helpers/date';
let debug = require('debug')('deco-api:decorators:types:basics');

export let anyDecorator = new TypeDecorator('any');
export const any = anyDecorator.decorator();

export let idDecorator = new TypeDecorator('id');
export const id = idDecorator.decorator();

export let inputString = (value: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (value !== null && value !== undefined && typeof value !== 'string' && value.toString) {
    value = value.toString();
  }
  return value;
};
export let validateString = (value: any, options?: any) => {
  if (value === null || value === undefined) return true;
  if (!options || !options.multilang && typeof value === 'string') return true;
  // here we validate multilang strings
  if (typeof value !== 'object') return false;
  for (let key in value) {
    if (options.locales.length && options.locales.indexOf(key) === -1) return false;
  }
  return true;
};
export let stringDecorator = new TypeDecorator('string');
stringDecorator.defaultOptions = {
  multilang: false,
  locales: []
};
stringDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  if (!options || !options.multilang) return Promise.resolve(inputString(value));

  let locale = '';
  let reqLocale = (element.request.query && element.request.query.locale) ? element.request.query.locale : '';
  if (reqLocale && options.locales.indexOf(reqLocale) !== -1) {
    locale = element.request.query.locale;
  } else if (reqLocale && options.locales.length === 0) {
    locale = element.request.query.locale;
  } else if (reqLocale === 'all') {
    locale = '';
  } else if (reqLocale) {
    return Promise.reject(new Error('Invalid locale requested'));
  }

  if (locale && element[key] && typeof element[key] === 'object' && typeof value === 'string') {
    let tmpValue = element[key];
    tmpValue[locale] = value;
    value = tmpValue;
  } else if (locale && typeof value === 'string') {
    let tmpValue: any = {};
    tmpValue[locale] = value;
    value = tmpValue;
  }

  if (!locale && typeof value === 'string') {
    return Promise.reject(new Error('Multilang string value must be an object if ?locale is not defined'));
  } else {
    // only keep valid locale
    let tmpValue: any = {};
    for (let key in value) {
      if (options.locales.length && options.locales.indexOf(key) === -1) continue;
      tmpValue[key] = value[key];
    }
    value = tmpValue;
  }

  return Promise.resolve(value);
};
stringDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  if (!options || !options.multilang) return Promise.resolve(value);

  let locale = Settings.locale(element.request, options);
  if (locale === 'all') {
    // do nothing, send all locales
  } else if (locale && value !== null && typeof value === 'object') {
    if (options.locales.length && options.locales.indexOf(locale) === -1) return Promise.reject(new Error('Invalid locale requested'));
    // send only the requested locale
    let originalValue = value;
    value = value[locale];
    // if we request a refLocale
    let refLocale = (element.request && element.request.query && element.request.query.reflocale) ? element.request.query.reflocale : '';
    let refLocaleIsValid = false;
    if (options.locales.length && options.locales.indexOf(refLocale) !== -1) {
      refLocaleIsValid = true;
    } else if (options.locales.length === 0) {
      refLocaleIsValid = true;
    }
    if (refLocaleIsValid) {
      if (!element._refLocales) element._refLocales = {};
      if (!element._refLocales[refLocale]) element._refLocales[refLocale] = {};
      element._refLocales[refLocale][key] = originalValue[refLocale];
    }
  }
  return Promise.resolve(value);
};
stringDecorator.validate = (value: any, obj: any, options: any) => {
  return validateString(value, options);
};
export const string = stringDecorator.decorator();

export let selectDecorator = new TypeDecorator('select');
selectDecorator.defaultOptions = {
  options: [],
  multiple: false,
  allowAny: false
};
selectDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (value === null || value === undefined) return Promise.resolve(value);
  if (options.multiple && !Array.isArray(value)) value = [value];
  if (!options.multiple && Array.isArray(value)) value = value.join(',');
  return Promise.resolve(value);
};
selectDecorator.validate = (value: any, obj: any, options: any) => {
  if (value === undefined || value === null) return true;
  if (!options.multiple) {
    // validate non-multiple values
    if (typeof value !== 'string') return false;
    if (options.allowAny) return true;
    if (options.options.indexOf(value) === -1) return false;
  } else if (options.multiple) {
    // validate multiple values
    if (!Array.isArray(value)) return false;
    for (let v of value) {
      if (typeof v !== 'string') return false;
      if (!options.allowAny && options.options.indexOf(v) === -1) return false;
    }
  }
  return true;
};
export const select = selectDecorator.decorator();

export let inputInteger = (value: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (typeof value === 'string') {
    let int = parseInt(value, 10);
    if (int.toString() === value) {
      value = int;
    }
  };
  return value;
};
export let validateInteger = (value: any) => {return value === null || value === undefined || (typeof value === 'number' && Math.round(value) === value)};
export let integerDecorator = new TypeDecorator('integer');
integerDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(inputInteger(value));
};
integerDecorator.validate = (value: any, obj: any, options: any) => {
  return validateInteger(value);
};
export const integer = integerDecorator.decorator();

export let inputBoolean = (value: any) => {
  if (value === 'null') value = undefined;
  if (value === 'undefined') value = undefined;
  if (value === 1 || value === '1' || value === 'true') {
    value = true;
  } else if (value === 0 || value === '0' || value === 'false') {
    value = false;
  }
  if (value !== true && value !== false && value !== undefined) value = undefined;
  return value;
};
export let validateBoolean = (value: any) => {return value === null || value === undefined || typeof value === 'boolean'};
export let booleanDecorator = new TypeDecorator('boolean');
booleanDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(inputBoolean(value));
};
booleanDecorator.validate = (value: any, obj: any, options: any) => {
  return validateBoolean(value);
};
// booleanDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
//   if (value !== true && value !== false && value !== undefined) value = undefined;
//   if (value === undefined && operation === 'insert') {
//     return Promise.resolve();
//   } else if (value === undefined) {
//     updateQuery.unset(key);
//   } else {
//     updateQuery.set(key, value);
//   }
//   return Promise.resolve();
// };
export const boolean = booleanDecorator.decorator();

export let inputDate = (value: any, dateFormat = Settings.defaultDateFormat) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (typeof value === 'string') {
    let date = moment(value, dateFormat, true);
    if (date.isValid()) value = date.toDate();
  }
  return value;
};
export let validateDate = (value: any, dateFormat?: string) => {
  if (typeof value === 'string') {
    // we do this string test / convert here because
    // the validateDate can be called from an array or object validator
    // which did not pass through the inputDate()
    // in which case we suppose a ISO format
    const date = dateFormat ? moment(value, dateFormat) : DateHelper.moment(value);
    if (!date || !date.isValid()) {
      debug('invalid date', value, '; dateFormat: ', dateFormat);
      return false;
    }
    value = date.toDate();
  }
  return value === null || value === undefined || value instanceof Date
};
export let dateDecorator = new TypeDecorator('date');
dateDecorator.defaultOptions = {
  dateFormat: Settings.defaultDateFormat
};
dateDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  let dateFormat = options.dateFormat || Settings.defaultDateFormat;
  return Promise.resolve(inputDate(value, dateFormat));
};
dateDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  if (value instanceof Date) {
    let dateFormat = options.dateFormat || Settings.defaultDateFormat;
    value = moment(value).format(dateFormat);
  }
  return Promise.resolve(value);
};
dateDecorator.validate = (value: any, obj: any, options: any) => {
  let dateFormat = options.dateFormat || undefined;
  return validateDate(value, dateFormat);
};
export const date = dateDecorator.decorator();

export let inputFloat = (value: any) => {
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (typeof value === 'string') {
    let float = parseFloat(value);
    if (float.toString() === value) {
      value = float;
    }
  }
  return value;
};
export let validateFloat = (value: any) => {return value === null || value === undefined || (typeof value === 'number')};
export let floatDecorator = new TypeDecorator('float');
floatDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(inputFloat(value));
};
floatDecorator.validate = (value: any, obj: any, options: any) => {
  return validateFloat(value);
};
export const float = floatDecorator.decorator();