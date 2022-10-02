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
exports.increment = exports.validateIncrement = exports.inputIncrement = exports.incrementDecorator = void 0;
const datastore_1 = require("./../../helpers/datastore");
const type_decorator_1 = require("./type-decorator");
let debug = require('debug')('deco-api:decorators:types:increment');
exports.incrementDecorator = new type_decorator_1.TypeDecorator('increment');
exports.incrementDecorator.requireDeco = true;
exports.inputIncrement = (value, options) => {
    return undefined;
};
exports.incrementDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputIncrement(value, options));
};
exports.validateIncrement = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    return true;
});
exports.incrementDecorator.validate = (value, obj, options) => {
    return exports.validateIncrement(value, options);
};
let counters = {};
exports.incrementDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (!options.deco) {
        console.warn('Missing deco in increment decorator');
        return Promise.resolve();
    }
    let deco = options.deco;
    if (element[key])
        return Promise.resolve();
    let counterId = options.deco.collectionName + ':' + key;
    let counterMin = options.min || 1;
    let counterPromise;
    if (counters[counterId]) {
        counters[counterId] = counters[counterId] + 1;
        counterPromise = Promise.resolve(counters[counterId]);
    }
    else {
        let projection = {};
        projection[key] = 1;
        let sort = {};
        sort[key] = -1;
        counterPromise = datastore_1.datastore.db.collection(deco.collectionName).find({}, { projection: projection, sort: sort, limit: 1 }).toArray().then((result) => {
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
exports.increment = exports.incrementDecorator.decorator();
//# sourceMappingURL=increment.js.map