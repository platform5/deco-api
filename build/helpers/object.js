"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectHelper {
    static filter(original, allowed) {
        return Object.keys(original)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
            obj[key] = original[key];
            return obj;
        }, {});
    }
    static includeKeys(original, allowed) {
        return ObjectHelper.filter(original, allowed);
    }
    static excludeKeys(original, rejected) {
        return Object.keys(original)
            .filter(key => !rejected.includes(key))
            .reduce((obj, key) => {
            obj[key] = original[key];
            return obj;
        }, {});
    }
}
exports.ObjectHelper = ObjectHelper;
//# sourceMappingURL=object.js.map