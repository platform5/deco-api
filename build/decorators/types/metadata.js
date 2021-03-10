"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const type_decorator_1 = require("./type-decorator");
let debug = require('debug')('deco-api:decorators:types:metadata');
exports.inputMetadata = (value, options) => {
    if (value === 'null')
        value = undefined;
    if (value === 'undefined')
        value = undefined;
    if (value === null)
        value = undefined;
    return value;
};
exports.validateMetadata = (value, options) => {
    if (value === null)
        return true;
    if (value === undefined)
        return true;
    if (value === 'null')
        return true;
    if (!Array.isArray(value))
        return false;
    let allowedKeys = ['key', 'value', 'type'];
    for (let data of value) {
        if (typeof data !== 'object')
            return false;
        let keys = Object.keys(data);
        for (let key of keys) {
            if (allowedKeys.indexOf(key) === -1)
                return false;
        }
        if (data.key === undefined)
            return false;
        if (data.value === undefined)
            return false;
    }
    return true;
};
exports.metadataDecorator = new type_decorator_1.TypeDecorator('metadata');
exports.metadataDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputMetadata(value, options));
};
exports.metadataDecorator.validate = (value, obj, options) => {
    return exports.validateMetadata(value, options);
};
exports.metadataDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (value === null || value === undefined || value === 'null') {
        updateQuery.unset(key, '');
    }
    else {
        updateQuery.set(key, value);
    }
    return Promise.resolve();
};
exports.metadata = exports.metadataDecorator.decorator();
//# sourceMappingURL=metadata.js.map