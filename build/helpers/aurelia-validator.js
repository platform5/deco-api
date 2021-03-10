"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aureliaValidator = void 0;
require("aurelia-polyfills");
const aurelia_pal_nodejs_1 = require("aurelia-pal-nodejs");
const aurelia_dependency_injection_1 = require("aurelia-dependency-injection");
const aurelia_templating_binding_1 = require("aurelia-templating-binding");
const aurelia_validation_1 = require("aurelia-validation");
class AureliaValidator {
    constructor() {
        aurelia_pal_nodejs_1.initialize();
        const container = new aurelia_dependency_injection_1.Container();
        aurelia_templating_binding_1.configure({ container });
        aurelia_validation_1.configure({ container });
        this.validator = container.get(aurelia_validation_1.Validator);
    }
    validateObject(object, rules) {
        return this.validator.validateObject(object, rules).then(results => {
            let isValid = results.every(r => r.valid);
            let errors = results.map(r => r.message).filter(m => !!m);
            if (!isValid && errors[0])
                throw new Error(errors[0]);
            return results;
        });
    }
}
exports.aureliaValidator = new AureliaValidator();
//# sourceMappingURL=aurelia-validator.js.map