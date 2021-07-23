"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const moment_1 = __importDefault(require("moment"));
class Parser {
    static valueInObject(obj, path) {
        const args = path.split('.');
        return args.reduce((obj, level) => obj && obj[level], obj);
    }
    static parseMetadata(key, object) {
        for (let meta of object.metadata || []) {
            if (meta.key === key) {
                return meta.value;
            }
        }
        return '';
    }
    static parseObject(parts, object) {
        if (typeof object !== 'object')
            return undefined;
        let replace = undefined;
        // extract value
        if (parts[0] === 'metadata') {
            replace = Parser.parseMetadata(parts[1], object);
            parts.shift();
            parts.shift();
        }
        else {
            replace = Parser.valueInObject(object, parts[0]);
            parts.shift();
        }
        if (!replace) {
            return replace;
        }
        // apply converter
        if (parts[0] === 'date' && parts[1]) {
            const date = Parser.parseDate(replace);
            replace = date === '' ? '' : date.format(parts[1]);
        }
        if (parts[0] === 'round' && parts[1]) {
            replace = parseFloat(parseFloat(replace).toFixed(parseInt(parts[1], 10))).toString();
        }
        return replace;
    }
    static parseDate(text) {
        if (!text) {
            return '';
        }
        const simpleParsing = moment_1.default(text);
        if (simpleParsing.isValid()) {
            return simpleParsing;
        }
        const basicParsing = moment_1.default(text, 'DD-MM-YYYY');
        if (basicParsing.isValid()) {
            return basicParsing;
        }
        return '';
    }
    static parseTemplate(text, objects) {
        if (typeof text !== 'string' || text.length === 0) {
            return text;
        }
        const matches = text.match(/(#|!!|!){(.*?)}/gm);
        if (!matches) {
            return text;
        }
        for (const original of matches) {
            const specificMatches = original.match(/(#|!!|!){(.*?)}/m);
            const replaceOperator = specificMatches[1];
            const parts = specificMatches[2].split(':');
            let replace = undefined;
            let object = objects[parts[0]];
            parts.shift();
            replace = Parser.parseObject(parts, object);
            // If the original is written with !{...} it means that if the value is not found (undefined)
            // we will remove the entire line
            // But if the original is written with #{} it means that we simply display an empty value (empty string '')
            if (replace === undefined && replaceOperator === '#') {
                replace = ''; // set an empty string => it will trigger the replace
            }
            if (replace === '' && replaceOperator === '!') {
                replace = undefined;
            }
            if ((!replace || replace === '0') && replaceOperator === '!!') {
                replace = undefined;
            }
            if (replace !== undefined) {
                text = text.replace(original, replace);
            }
        }
        // remove all lines still containing a !{}
        text = text.split('\n').filter(line => !line.includes('!{')).join('\n');
        return text;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map