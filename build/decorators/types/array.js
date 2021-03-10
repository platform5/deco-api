"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.array = exports.validateArray = exports.inputArray = exports.arrayDecorator = void 0;
const type_decorator_1 = require("./type-decorator");
const basics_1 = require("./basics");
const basics_2 = require("./basics");
const object_1 = require("./object");
let debug = require('debug')('deco-api:decorators:types:array');
exports.arrayDecorator = new type_decorator_1.TypeDecorator('array');
exports.inputArray = (value, options) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (typeof value === 'string') {
        try {
            let testJsonParse = JSON.parse(value);
            if (Array.isArray(testJsonParse))
                value = testJsonParse;
            else
                throw new Error('fake error to go to catch block');
        }
        catch (e) {
            value = value.split(',').map((item) => item.trim());
        }
    }
    if (!Array.isArray(value))
        return value;
    if (options && options.type) {
        let newValue = value.map(item => item);
        for (let index in value) {
            if (options.type === 'string')
                newValue[index] = (basics_1.inputString(value[index]));
            if (options.type === 'integer')
                newValue[index] = basics_1.inputInteger(value[index]);
            if (options.type === 'float')
                newValue[index] = basics_1.inputFloat(value[index]);
            if (options.type === 'boolean')
                newValue[index] = basics_1.inputBoolean(value[index]);
            if (options.type === 'date')
                newValue[index] = basics_1.inputDate(value[index]);
            if (options.type === 'object' && options.options)
                newValue[index] = object_1.inputObject(value[index], options.options);
        }
        value = newValue;
    }
    return value;
};
exports.arrayDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputArray(value, options));
};
exports.validateArray = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (value === null || value === undefined)
        return true;
    if (!Array.isArray(value))
        return false;
    if (options && options.type) {
        for (let item of value) {
            if (options.type === 'string' && !basics_2.validateString(item))
                return false;
            if (options.type === 'integer' && !basics_2.validateInteger(item))
                return false;
            if (options.type === 'float' && !basics_2.validateFloat(item))
                return false;
            if (options.type === 'boolean' && !basics_2.validateBoolean(item))
                return false;
            if (options.type === 'date' && !basics_2.validateDate(item))
                return false;
            if (options.type === 'object' && options.options && !(yield object_1.validateObject(item, options.options)))
                return false;
        }
    }
    return true;
});
exports.arrayDecorator.validate = (value, obj, options) => {
    return exports.validateArray(value, options);
};
exports.array = exports.arrayDecorator.decorator();
//# sourceMappingURL=array.js.map