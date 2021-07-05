"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateHelper = void 0;
const moment_1 = __importDefault(require("moment"));
class DateHelper {
    static moment(date, suggestedFormat) {
        if (!date)
            return undefined;
        let m;
        if (typeof date === 'string') {
            const seemsIsoString = date.includes('T') && date.includes('Z');
            if (seemsIsoString) {
                m = moment_1.default(date, 'YYYY-MM-DDTHH:mm:ss.SSSSZ');
                if (m.isValid()) {
                    return m;
                }
            }
            if (suggestedFormat) {
                const formats = Array.isArray(suggestedFormat) ? suggestedFormat : [suggestedFormat];
                for (const format of formats) {
                    m = moment_1.default(date, format);
                    if (m.isValid()) {
                        return m;
                    }
                    m = undefined;
                }
            }
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
        else if (date instanceof Date) {
            m = moment_1.default(date);
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
    static recurrence(start, end, unit, frequency, daysOfWeekOrMonth, options) {
        if (!start.isValid() || !end.isValid || end.isBefore(start)) {
            throw new Error('Invalid start/end dates, end must be after start');
        }
        const nbDaysLimit = (options === null || options === void 0 ? void 0 : options.nbDaysLimit) || 365 * 5;
        if (end.diff(start, 'days') > nbDaysLimit) {
            throw new Error('Invalid start/end dates, end is too far from start');
        }
        const current = start.clone();
        const dates = [];
        const modulos = {
            '1/1': 1,
            '1/2': 2,
            '1/3': 3,
            '1/4': 4
        };
        let unitNb = 1;
        let unitIndex = unit === 'w' ? current.week() : current.month();
        while (current.isSameOrBefore(end)) {
            if (unit === 'w' && !daysOfWeekOrMonth.includes(current.isoWeekday())) {
                current.add(1, 'day');
                continue; // ignored as not the right day of week
            }
            if (unit === 'm' && !daysOfWeekOrMonth.includes(current.day())) {
                current.add(1, 'day');
                continue; // ignored as not the right day of week
            }
            const currentUnitIndex = unit === 'w' ? current.week() : current.month();
            if (unitIndex !== currentUnitIndex) {
                unitNb++;
            }
            unitIndex = currentUnitIndex;
            if (unitNb % modulos[frequency] === 0) {
                dates.push(current.clone());
            }
            current.add(1, 'day');
        }
        return dates;
    }
}
exports.DateHelper = DateHelper;
//# sourceMappingURL=date.js.map