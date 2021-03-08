"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aurelia_validation_1 = require("aurelia-validation");
exports.ValidationRules = aurelia_validation_1.ValidationRules;
let debug = require('debug')('deco-api:decorators:validate');
function addTargetValidation(target, type, key, options = {}) {
    if (!target._validations)
        target._validations = {};
    if (!target._validations[key])
        target._validations[key] = [];
    let validation = {
        type: type,
        options: options
    };
    target._validations[key].push(validation);
}
exports.addTargetValidation = addTargetValidation;
exports.required = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetValidation(target, 'required', key);
    if (descriptor)
        return descriptor;
};
exports.minLength = (minLength = 0) => {
    return (target, key, descriptor) => {
        if (descriptor)
            descriptor.writable = true;
        addTargetValidation(target, 'minLength', key, { minLength: minLength });
        if (descriptor)
            return descriptor;
    };
};
exports.maxLength = (maxLength = 0) => {
    return (target, key, descriptor) => {
        if (descriptor)
            descriptor.writable = true;
        addTargetValidation(target, 'maxLength', key, { maxLength: maxLength });
        if (descriptor)
            return descriptor;
    };
};
exports.email = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetValidation(target, 'email', key);
    if (descriptor)
        return descriptor;
};
exports.slug = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetValidation(target, 'slug', key);
    if (descriptor)
        return descriptor;
};
exports.uniqueByApp = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetValidation(target, 'uniqueByApp', key);
    if (descriptor)
        return descriptor;
};
aurelia_validation_1.ValidationRules.customRule(`validate:uniqueByApp`, (value, obj, options) => {
    var _a, _b;
    if (value === null || value === undefined || value === '')
        return true;
    let query = {};
    query[options.key] = value;
    query._id = { $ne: options.instance._id };
    if (options.instance.appId) {
        query.appId = options.instance.appId;
    }
    else if (options.instance.request && options.instance.request.body) {
        let req = options.instance.request;
        query.appId = (_b = (_a = req) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.appId;
    }
    return options.target.getOneWithQuery(query).then((element) => {
        if (element)
            return false;
        return true;
    });
}, `This \${$propertyName} already exists`);
//# sourceMappingURL=validate.js.map