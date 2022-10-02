"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDeco = void 0;
function cloneDeco(deco) {
    let cloned = {
        collectionName: deco.collectionName,
        modelName: deco.modelName,
        modelId: deco.modelId ? deco.modelId : undefined,
        options: Object.assign({}, deco.options),
        db: deco.db,
        propertyTypes: Object.assign({}, deco.propertyTypes),
        propertyTypesOptions: Object.assign({}, deco.propertyTypesOptions),
        propertyInputs: [].concat(deco.propertyInputs),
        propertyOutputs: [].concat(deco.propertyOutputs),
        propertyToDocuments: [].concat(deco.propertyToDocuments),
        propertyValidations: Object.assign({}, deco.propertyValidations),
        propertySearchables: [].concat(deco.propertySearchables),
        propertySortables: [].concat(deco.propertySortables),
        propertyFilterables: [].concat(deco.propertyFilterables),
        propertyFilterablesOptions: Object.assign({}, deco.propertyFilterablesOptions)
    };
    return cloned;
}
exports.cloneDeco = cloneDeco;
//# sourceMappingURL=deco.js.map