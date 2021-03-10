"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// aurelia-validation tips
// https://stackoverflow.com/a/49354106/437725
require("aurelia-polyfills");
const aurelia_validation_1 = require("aurelia-validation");
let debug = require('debug')('deco-api:decorators:types:type-decorator');
class TypeDecorator {
    constructor(name) {
        this.defaultOptions = {};
        this.requireDeco = false;
        this.customValidationRuleReady = false;
        this.name = name;
        this.input = (key, value, options, element, target) => {
            return Promise.resolve(value);
        };
        this.output = (key, value, options, element, target) => {
            return Promise.resolve(value);
        };
        this.toString = (key, value, options, element, target) => {
            if (typeof value === 'string')
                return Promise.resolve(value);
            if (value.toString && typeof value.toString === 'function')
                return Promise.resolve(value.toString());
            return Promise.resolve('');
        };
        this.toDocument = (updateQuery, key, value, operation, options, element, target) => {
            if (value === undefined) {
                if (operation === 'insert') {
                    return Promise.resolve();
                }
                else {
                    updateQuery.unset(key);
                }
            }
            else {
                updateQuery.set(key, value);
            }
            return Promise.resolve();
        };
        this.validate = (value, obj, options) => {
            return true;
        };
    }
    decorator() {
        if (!this.customValidationRuleReady) {
            this.createCustomValidationRule();
            this.customValidationRuleReady = true;
        }
        return (optionsOrTarget, key, descriptor) => {
            let options = {};
            if (key) {
                // used without parameters
                options = Object.assign(options, this.defaultOptions);
            }
            else {
                options = Object.assign(options, this.defaultOptions, optionsOrTarget);
            }
            let deco = (target, key, descriptor) => {
                if (descriptor)
                    descriptor.writable = true;
                if (!target._types) {
                    target._types = setBaseModelTypes();
                }
                if (!target._typesOptions)
                    target._typesOptions = {};
                target._types[key] = this;
                target._typesOptions[key] = this.optionsHook(options, target, key);
                this.postConfigHook(options, target, key);
                if (descriptor)
                    return descriptor;
            };
            if (key) {
                return deco(optionsOrTarget, key, descriptor);
            }
            else {
                return deco;
            }
        };
    }
    optionsHook(options, target, key) {
        return options;
    }
    postConfigHook(options, target, key) {
        return;
    }
    createCustomValidationRule() {
        aurelia_validation_1.ValidationRules.customRule(`type:${this.name}`, this.validate, `The \${$propertyName} property is not valid (${this.name})`);
    }
}
exports.TypeDecorator = TypeDecorator;
const basics_1 = require("../types/basics");
function setBaseModelTypes() {
    return {
        _id: basics_1.idDecorator,
        _createdAt: basics_1.dateDecorator,
        _updatedAt: basics_1.dateDecorator,
        _createdBy: basics_1.idDecorator,
        _updatedBy: basics_1.idDecorator
    };
}
//# sourceMappingURL=type-decorator.js.map