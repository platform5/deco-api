"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelper = void 0;
const moment_1 = __importDefault(require("moment"));
class DateHelper {
    static moment(date) {
        if (!date)
            return undefined;
        let m;
        if (typeof date === 'string') {
            if (date.length === 10 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-') {
                m = moment_1.default(date, 'DD-MM-YYYY');
            }
            else if (date.length === 16 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
                m = moment_1.default(date, 'DD-MM-YYYY HH:mm');
            }
            else if (date.length === 8 && date.substr(2, 1) === '-' && date.substr(5, 1) === '-') {
                m = moment_1.default(date, 'DD-MM-YY');
            }
            else if (date.length === 10 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/') {
                m = moment_1.default(date, 'DD/MM/YYYY');
            }
            else if (date.length === 16 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
                m = moment_1.default(date, 'DD/MM/YYYY HH:mm');
            }
            else if (date.length === 8 && date.substr(2, 1) === '/' && date.substr(5, 1) === '/') {
                m = moment_1.default(date, 'DD/MM/YY');
            }
            else if (date.length === 10 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.') {
                m = moment_1.default(date, 'DD.MM.YYYY');
            }
            else if (date.length === 16 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.' && date.substr(10, 1) === ' ' && date.substr(13, 1) === ':') {
                m = moment_1.default(date, 'DD.MM.YYYY HH:mm');
            }
            else if (date.length === 8 && date.substr(2, 1) === '.' && date.substr(5, 1) === '.') {
                m = moment_1.default(date, 'DD.MM.YY');
            }
            else if (date.length > 10 && date.indexOf('T') !== -1 && date.indexOf('+') !== -1) {
                m = moment_1.default(date);
            }
            else {
                m = moment_1.default(date);
            }
        }
        else if (!moment_1.default.isMoment(date)) {
            m = moment_1.default(date);
            if (!m.isValid) {
                return undefined;
            }
        }
        else {
            m = date;
        }
        return m;
    }
}
exports.DateHelper = DateHelper;
//# sourceMappingURL=date.js.map