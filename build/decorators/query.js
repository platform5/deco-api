"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function addTargetInfo(target, typeName, key, options = {}) {
    if (!target[`_${typeName}`])
        target[`_${typeName}`] = [];
    if (!target[`_${typeName}Options`])
        target[`_${typeName}Options`] = {};
    target[`_${typeName}`].push(key);
    target[`_${typeName}Options`][key] = options;
}
exports.addTargetInfo = addTargetInfo;
exports.searchable = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    if (!target._searchables)
        target._searchables = [];
    target._searchables.push(key);
    if (descriptor)
        return descriptor;
};
exports.filterable = (options = { type: 'auto' }) => {
    return (target, key, descriptor) => {
        if (descriptor)
            descriptor.writable = true;
        if (!target._filterables)
            target._filterables = [];
        if (!target._filterablesOptions)
            target._filterablesOptions = {};
        target._filterables.push(key);
        target._filterablesOptions[key] = options;
        if (descriptor)
            return descriptor;
    };
};
exports.sortable = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    if (!target._sortables)
        target._sortables = [];
    target._sortables.push(key);
    if (descriptor)
        return descriptor;
};
exports.all = (target, key, descriptor) => {
    if (descriptor)
        descriptor.writable = true;
    exports.searchable(target, key, descriptor);
    exports.sortable(target, key, descriptor);
    if (!target._filterables)
        target._filterables = [];
    if (!target._filterablesOptions)
        target._filterablesOptions = {};
    target._filterables.push(key);
    target._filterablesOptions[key] = { type: 'auto' };
    if (descriptor)
        return descriptor;
};
//# sourceMappingURL=query.js.map