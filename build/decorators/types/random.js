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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_decorator_1 = require("./type-decorator");
const crypto_1 = __importDefault(require("crypto"));
let debug = require('debug')('deco-api:decorators:types:random');
exports.randomDecorator = new type_decorator_1.TypeDecorator('random');
exports.inputRandom = (value, options) => {
    return undefined;
};
exports.randomDecorator.input = (key, value, options, target) => {
    return Promise.resolve(exports.inputRandom(value, options));
};
exports.validateRandom = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    return true;
});
exports.randomDecorator.validate = (value, obj, options) => {
    return exports.validateRandom(value, options);
};
exports.randomDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => {
    if (element[key]) {
        updateQuery.set(key, value);
        return Promise.resolve();
    }
    let len = options.nbChars || 8;
    let token = crypto_1.default.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    updateQuery.set(key, token);
    return Promise.resolve();
};
exports.random = exports.randomDecorator.decorator();
//# sourceMappingURL=random.js.map