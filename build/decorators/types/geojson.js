"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGeojson = exports.geojsonFeature = exports.geojsonFeatureDecorator = void 0;
const type_decorator_1 = require("./type-decorator");
const geojson_validation_1 = __importDefault(require("geojson-validation"));
exports.geojsonFeatureDecorator = new type_decorator_1.TypeDecorator('geojsonFeature');
exports.geojsonFeature = exports.geojsonFeatureDecorator.decorator();
exports.geojsonFeatureDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(value);
};
exports.geojsonFeatureDecorator.output = (key, value, options, element, target) => {
    return Promise.resolve(value);
};
exports.geojsonFeatureDecorator.validate = (value, obj, options) => {
    return validateGeojson(value, options);
};
function validateGeojson(value, options) {
    return Promise.resolve(geojson_validation_1.default.isFeature(value, false));
}
exports.validateGeojson = validateGeojson;
//# sourceMappingURL=geojson.js.map