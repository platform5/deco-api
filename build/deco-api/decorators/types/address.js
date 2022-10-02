"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressArray = exports.addressArrayDecorator = exports.validateAddressArray = exports.inputAddressArray = exports.address = exports.addressDecorator = exports.validateAddress = exports.inputAddress = void 0;
const index_1 = require("../index");
let debug = require('debug')('app:decorators:address');
exports.inputAddress = (value) => {
    if (value === null || value === undefined) {
        value = undefined;
    }
    return value;
};
exports.validateAddress = (value, options) => {
    if (value === undefined)
        return true;
    if (typeof value !== 'object')
        return false;
    let allowedKeys = ['label', 'street', 'city', 'zip', 'country', 'description', 'lat', 'lng'];
    let stringKeys = ['label', 'street', 'city', 'zip', 'country', 'description'];
    let numberKeys = ['lat', 'lng'];
    for (let key in value) {
        if (allowedKeys.indexOf(key) === -1)
            return false;
        if (stringKeys.includes(key) && typeof value[key] !== 'string')
            return false;
        if (numberKeys.includes(key) && typeof value[key] !== 'number')
            return false;
    }
    return true;
};
exports.addressDecorator = new index_1.TypeDecorator('address');
exports.addressDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputAddress(value));
};
exports.addressDecorator.output = (key, value, options, element, target) => {
    return Promise.resolve(value);
};
exports.addressDecorator.validate = (value, obj, options) => {
    return exports.validateAddress(value, options);
};
exports.address = exports.addressDecorator.decorator();
exports.inputAddressArray = (value) => {
    if (value === null || value === undefined) {
        value = [];
    }
    return value;
};
exports.validateAddressArray = (value, options) => {
    if (!Array.isArray(value))
        return false;
    for (let index in value) {
        let v = value[index];
        if (!exports.validateAddress(v))
            return false;
    }
    return true;
};
exports.addressArrayDecorator = new index_1.TypeDecorator('addressArray');
exports.addressArrayDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputAddressArray(value));
};
exports.addressArrayDecorator.output = (key, value, options, element, target) => {
    return Promise.resolve(value);
};
exports.addressArrayDecorator.validate = (value, obj, options) => {
    return exports.validateAddressArray(value, options);
};
exports.addressArray = exports.addressArrayDecorator.decorator();
//# sourceMappingURL=address.js.map