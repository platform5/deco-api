"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../../");
const type_decorator_1 = require("./type-decorator");
let debug = require('debug')('deco-api:decorators:types:increment-by-app');
exports.incrementByAppDecorator = new type_decorator_1.TypeDecorator('increment-by-app');
exports.incrementByAppDecorator.requireDeco = true;
exports.inputIncrementByApp = (value, options) => {
    return undefined;
};
exports.incrementByAppDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputIncrementByApp(value, options));
};
exports.validateIncrementByApp = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    return true;
});
exports.incrementByAppDecorator.validate = (value, obj, options) => {
    return exports.validateIncrementByApp(value, options);
};
let counters = {};
exports.incrementByAppDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (!options.deco) {
        console.warn('Missing deco in increment decorator');
        return Promise.resolve();
    }
    let deco = options.deco;
    if (element[key]) {
        updateQuery.set(key, value);
        return Promise.resolve();
    }
    if (!element.appId) {
        throw new Error('incrementByAppDecorator only works for elements with appId set');
    }
    let appIdString = '';
    try {
        appIdString = element.appId.toString();
    }
    catch (error) {
        throw new Error('incrementByAppDecorator: invalid appId');
    }
    let counterId = options.deco.collectionName + ':' + appIdString + ':' + key;
    let counterMin = options.min || 1;
    let counterPromise;
    if (counters[counterId] && false) {
        counters[counterId] = counters[counterId] + 1;
        counterPromise = Promise.resolve(counters[counterId]);
        // At first we wanted to keep this memory counter
        // and add a check on the counter value to make sure it doesn't exists
        // but after working on this I realize it's best to always go through the checker below
    }
    else {
        let projection = {};
        projection[key] = 1;
        let sort = {};
        sort[key] = -1;
        counterPromise = __1.datastore.db.collection(deco.collectionName).find({ appId: element.appId }, { projection: projection, sort: sort, limit: 1 }).toArray().then((result) => {
            let value = counterMin;
            if (result && result.length && result[0][key]) {
                value = Math.max(counterMin, result[0][key]);
            }
            counters[counterId] = value + 1;
            return counters[counterId];
        });
    }
    return counterPromise.then((inc) => {
        updateQuery.set(key, inc);
    });
};
exports.incrementByApp = exports.incrementByAppDecorator.decorator();
//# sourceMappingURL=increment-by-app.js.map