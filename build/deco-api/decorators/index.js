"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongo = exports.validate = exports.type = exports.query = exports.io = exports.Policies = exports.TypeDecorator = void 0;
const type_decorator_1 = require("./types/type-decorator");
Object.defineProperty(exports, "TypeDecorator", { enumerable: true, get: function () { return type_decorator_1.TypeDecorator; } });
__exportStar(require("./model"), exports);
const Policies = __importStar(require("./policy"));
exports.Policies = Policies;
const io = __importStar(require("./io"));
exports.io = io;
const query = __importStar(require("./query"));
exports.query = query;
const types = __importStar(require("./types/index"));
exports.type = types;
const validates = __importStar(require("./validate"));
exports.validate = validates;
const mongo = __importStar(require("./mongo"));
exports.mongo = mongo;
//# sourceMappingURL=index.js.map