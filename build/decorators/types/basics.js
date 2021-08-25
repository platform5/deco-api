"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.float = exports.floatDecorator = exports.validateFloat = exports.inputFloat = exports.date = exports.dateDecorator = exports.validateDate = exports.inputDate = exports.boolean = exports.booleanDecorator = exports.validateBoolean = exports.inputBoolean = exports.integer = exports.integerDecorator = exports.validateInteger = exports.inputInteger = exports.select = exports.selectDecorator = exports.string = exports.stringDecorator = exports.validateString = exports.inputString = exports.id = exports.idDecorator = exports.any = exports.anyDecorator = void 0;
const type_decorator_1 = require("./type-decorator");
const moment_1 = __importDefault(require("moment"));
const settings_1 = require("../../helpers/settings");
const date_1 = require("../../helpers/date");
let debug = require('debug')('deco-api:decorators:types:basics');
exports.anyDecorator = new type_decorator_1.TypeDecorator('any');
exports.any = exports.anyDecorator.decorator();
exports.idDecorator = new type_decorator_1.TypeDecorator('id');
exports.id = exports.idDecorator.decorator();
exports.inputString = (value) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (value !== null && value !== undefined && typeof value !== 'string' && value.toString) {
        value = value.toString();
    }
    return value;
};
exports.validateString = (value, options) => {
    if (value === null || value === undefined)
        return true;
    if (!options || !options.multilang && typeof value === 'string')
        return true;
    // here we validate multilang strings
    if (typeof value !== 'object')
        return false;
    for (let key in value) {
        if (options.locales.length && options.locales.indexOf(key) === -1)
            return false;
    }
    return true;
};
exports.stringDecorator = new type_decorator_1.TypeDecorator('string');
exports.stringDecorator.defaultOptions = {
    multilang: false,
    locales: []
};
exports.stringDecorator.input = (key, value, options, element, target) => {
    if (!options || !options.multilang)
        return Promise.resolve(exports.inputString(value));
    let locale = '';
    let reqLocale = (element.request.query && element.request.query.locale) ? element.request.query.locale : '';
    if (reqLocale && options.locales.indexOf(reqLocale) !== -1) {
        locale = element.request.query.locale;
    }
    else if (reqLocale && options.locales.length === 0) {
        locale = element.request.query.locale;
    }
    else if (reqLocale === 'all') {
        locale = '';
    }
    else if (reqLocale) {
        return Promise.reject(new Error('Invalid locale requested'));
    }
    if (locale && element[key] && typeof element[key] === 'object' && typeof value === 'string') {
        let tmpValue = element[key];
        tmpValue[locale] = value;
        value = tmpValue;
    }
    else if (locale && typeof value === 'string') {
        let tmpValue = {};
        tmpValue[locale] = value;
        value = tmpValue;
    }
    if (!locale && typeof value === 'string') {
        return Promise.reject(new Error('Multilang string value must be an object if ?locale is not defined'));
    }
    else {
        // only keep valid locale
        let tmpValue = {};
        for (let key in value) {
            if (options.locales.length && options.locales.indexOf(key) === -1)
                continue;
            tmpValue[key] = value[key];
        }
        value = tmpValue;
    }
    return Promise.resolve(value);
};
exports.stringDecorator.output = (key, value, options, element, target) => {
    if (!options || !options.multilang)
        return Promise.resolve(value);
    let locale = settings_1.Settings.locale(element.request, options);
    if (locale === 'all') {
        // do nothing, send all locales
    }
    else if (locale && value !== null && typeof value === 'object') {
        if (options.locales.length && options.locales.indexOf(locale) === -1)
            return Promise.reject(new Error('Invalid locale requested'));
        // send only the requested locale
        let originalValue = value;
        value = value[locale];
        // if we request a refLocale
        let refLocale = (element.request && element.request.query && element.request.query.reflocale) ? element.request.query.reflocale : '';
        let refLocaleIsValid = false;
        if (options.locales.length && options.locales.indexOf(refLocale) !== -1) {
            refLocaleIsValid = true;
        }
        else if (options.locales.length === 0) {
            refLocaleIsValid = true;
        }
        if (refLocaleIsValid) {
            if (!element._refLocales)
                element._refLocales = {};
            if (!element._refLocales[refLocale])
                element._refLocales[refLocale] = {};
            element._refLocales[refLocale][key] = originalValue[refLocale];
        }
    }
    return Promise.resolve(value);
};
exports.stringDecorator.validate = (value, obj, options) => {
    return exports.validateString(value, options);
};
exports.string = exports.stringDecorator.decorator();
exports.selectDecorator = new type_decorator_1.TypeDecorator('select');
exports.selectDecorator.defaultOptions = {
    options: [],
    multiple: false,
    allowAny: false
};
exports.selectDecorator.input = (key, value, options, element, target) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (value === null || value === undefined)
        return Promise.resolve(value);
    if (options.multiple && !Array.isArray(value))
        value = [value];
    if (!options.multiple && Array.isArray(value))
        value = value.join(',');
    return Promise.resolve(value);
};
exports.selectDecorator.validate = (value, obj, options) => {
    if (value === undefined || value === null)
        return true;
    if (!options.multiple) {
        // validate non-multiple values
        if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
            return false;
        if (options.allowAny)
            return true;
        if (options.options.indexOf(value) === -1)
            return false;
    }
    else if (options.multiple) {
        // validate multiple values
        if (!Array.isArray(value))
            return false;
        for (let v of value) {
            if (typeof v !== 'string')
                return false;
            if (!options.allowAny && options.options.indexOf(v) === -1)
                return false;
        }
    }
    return true;
};
exports.select = exports.selectDecorator.decorator();
exports.inputInteger = (value) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (typeof value === 'string') {
        let int = parseInt(value, 10);
        if (int.toString() === value) {
            value = int;
        }
    }
    ;
    return value;
};
exports.validateInteger = (value) => { return value === null || value === undefined || (typeof value === 'number' && Math.round(value) === value); };
exports.integerDecorator = new type_decorator_1.TypeDecorator('integer');
exports.integerDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputInteger(value));
};
exports.integerDecorator.validate = (value, obj, options) => {
    return exports.validateInteger(value);
};
exports.integer = exports.integerDecorator.decorator();
exports.inputBoolean = (value) => {
    if (value === 'null')
        value = undefined;
    if (value === 'undefined')
        value = undefined;
    if (value === 1 || value === '1' || value === 'true') {
        value = true;
    }
    else if (value === 0 || value === '0' || value === 'false') {
        value = false;
    }
    if (value !== true && value !== false && value !== undefined)
        value = undefined;
    return value;
};
exports.validateBoolean = (value) => { return value === null || value === undefined || typeof value === 'boolean'; };
exports.booleanDecorator = new type_decorator_1.TypeDecorator('boolean');
exports.booleanDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputBoolean(value));
};
exports.booleanDecorator.validate = (value, obj, options) => {
    return exports.validateBoolean(value);
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
exports.boolean = exports.booleanDecorator.decorator();
exports.inputDate = (value, dateFormat = settings_1.Settings.defaultDateFormat) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (typeof value === 'string') {
        let date = moment_1.default(value, dateFormat, true);
        if (date.isValid())
            value = date.toDate();
    }
    return value;
};
exports.validateDate = (value, dateFormat) => {
    if (typeof value === 'string') {
        // we do this string test / convert here because
        // the validateDate can be called from an array or object validator
        // which did not pass through the inputDate()
        // in which case we suppose a ISO format
        const date = dateFormat ? moment_1.default(value, dateFormat) : date_1.DateHelper.moment(value);
        if (!date || !date.isValid()) {
            debug('invalid date', value, '; dateFormat: ', dateFormat);
            return false;
        }
        value = date.toDate();
    }
    return value === null || value === undefined || value instanceof Date;
};
exports.dateDecorator = new type_decorator_1.TypeDecorator('date');
exports.dateDecorator.defaultOptions = {
    dateFormat: settings_1.Settings.defaultDateFormat
};
exports.dateDecorator.input = (key, value, options, element, target) => {
    let dateFormat = options.dateFormat || settings_1.Settings.defaultDateFormat;
    return Promise.resolve(exports.inputDate(value, dateFormat));
};
exports.dateDecorator.output = (key, value, options, element, target) => {
    if (value instanceof Date) {
        let dateFormat = options.dateFormat || settings_1.Settings.defaultDateFormat;
        value = moment_1.default(value).format(dateFormat);
    }
    return Promise.resolve(value);
};
exports.dateDecorator.validate = (value, obj, options) => {
    let dateFormat = options.dateFormat || undefined;
    return exports.validateDate(value, dateFormat);
};
exports.date = exports.dateDecorator.decorator();
exports.inputFloat = (value) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (typeof value === 'string') {
        let float = parseFloat(value);
        if (float.toString() === value) {
            value = float;
        }
    }
    return value;
};
exports.validateFloat = (value) => { return value === null || value === undefined || (typeof value === 'number'); };
exports.floatDecorator = new type_decorator_1.TypeDecorator('float');
exports.floatDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputFloat(value));
};
exports.floatDecorator.validate = (value, obj, options) => {
    return exports.validateFloat(value);
};
exports.float = exports.floatDecorator.decorator();
//# sourceMappingURL=basics.js.map