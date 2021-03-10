"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetch = exports.all = exports.inout = exports.toDocument = exports.output = exports.input = void 0;
let debug = require('debug')('deco-api:io');
function addTargetInfo(target, infoName, key) {
    if (!target[`_${infoName}`])
        target[`_${infoName}`] = [];
    target[`_${infoName}`].push(key);
}
exports.input = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetInfo(target, 'inputs', key);
    if (descriptor)
        return descriptor;
};
exports.output = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetInfo(target, 'outputs', key);
    if (descriptor)
        return descriptor;
};
exports.toDocument = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetInfo(target, 'toDocuments', key);
    if (descriptor)
        return descriptor;
};
exports.inout = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    exports.input(target, key, descriptor);
    exports.output(target, key, descriptor);
    if (descriptor)
        return descriptor;
};
exports.all = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    exports.input(target, key, descriptor);
    exports.output(target, key, descriptor);
    exports.toDocument(target, key, descriptor);
    if (descriptor)
        return descriptor;
};
exports.fetch = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    addTargetInfo(target, 'fetch', key);
    if (descriptor)
        return descriptor;
};
//# sourceMappingURL=io.js.map