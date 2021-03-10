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
const type_decorator_1 = require("./type-decorator");
const basics_1 = require("./basics");
const basics_2 = require("./basics");
const models_1 = require("./models");
const array_1 = require("./array");
let debug = require('debug')('deco-api:decorators:types:object');
exports.inputObject = (value, options) => {
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (typeof value === 'string') {
        try {
            let objectValue = JSON.parse(value);
            value = objectValue;
        }
        catch (error) {
            // do nothing
        }
    }
    if (value !== null && typeof value === 'object' && options && options.keys) {
        let allowOtherKeys = (options.allowOtherKeys === true);
        for (let key of Object.keys(value)) {
            let keySettings = options.keys[key];
            if (!keySettings)
                continue;
            if (keySettings.type === 'string')
                value[key] = basics_1.inputString(value[key]);
            if (keySettings.type === 'integer')
                value[key] = basics_1.inputInteger(value[key]);
            if (keySettings.type === 'float')
                value[key] = basics_1.inputFloat(value[key]);
            if (keySettings.type === 'boolean')
                value[key] = basics_1.inputBoolean(value[key]);
            if (keySettings.type === 'date')
                value[key] = basics_1.inputDate(value[key]);
            if (keySettings.type === 'array')
                value[key] = array_1.inputArray(value[key], keySettings.options);
            if (keySettings.type === 'model')
                value[key] = models_1.inputModel(value[key], keySettings.options, key);
            if (keySettings.type === 'models')
                value[key] = models_1.inputModels(value[key], keySettings.options, key);
        }
    }
    return value;
};
exports.validateObject = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (value === null || value === undefined)
        return true;
    if (typeof value !== 'object')
        return false;
    if (options && options.keys) {
        let allowOtherKeys = (options.allowOtherKeys === true);
        // validate required fields
        for (let key of Object.keys(options.keys)) {
            let keySettings = options.keys[key];
            if (keySettings.required === true && value[key] === undefined)
                return false;
        }
        for (let key of Object.keys(value)) {
            let keySettings = options.keys[key];
            if (!keySettings && !allowOtherKeys)
                return false;
            if (!keySettings)
                continue;
            if (keySettings.type === 'string' && !basics_2.validateString(value[key]))
                return false;
            if (keySettings.type === 'integer' && !basics_2.validateInteger(value[key]))
                return false;
            if (keySettings.type === 'float' && !basics_2.validateFloat(value[key]))
                return false;
            if (keySettings.type === 'boolean' && !basics_2.validateBoolean(value[key]))
                return false;
            if (keySettings.type === 'date' && !basics_2.validateDate(value[key]))
                return false;
            if (keySettings.type === 'array' && !(yield array_1.validateArray(value[key], keySettings.options)))
                return false;
            if (keySettings.type === 'model' && !(yield models_1.validateModel(value[key], keySettings.options)))
                return false;
            if (keySettings.type === 'models' && !(yield models_1.validateModels(value[key], keySettings.options)))
                return false;
        }
    }
    return true;
});
exports.objectDecorator = new type_decorator_1.TypeDecorator('object');
exports.objectDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputObject(value, options));
};
exports.objectDecorator.validate = (value, obj, options) => {
    return exports.validateObject(value, options);
};
exports.object = exports.objectDecorator.decorator();
//# sourceMappingURL=object.js.map