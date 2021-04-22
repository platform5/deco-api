"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheLastModified = void 0;
const moment_1 = __importDefault(require("moment"));
class CacheLastModified {
    static init() {
        return (req, res, next) => {
            const lastModifiedRequest = req.header('If-Modified-Since') || '';
            CacheLastModified.registerCacheLastModified(res, lastModifiedRequest);
            next();
        };
    }
    static send(prop = 'auto', source = 'locals') {
        return (req, res, next) => {
            let lastModifiedResponse = '';
            if (!res.locals.cacheLastModified) {
                return next('Missing cacheLastModified');
            }
            const lastModifiedRequest = res.locals.cacheLastModified.lastModified || '';
            let data;
            if (source === 'locals') {
                if (prop === 'auto') {
                    data = res.locals.elements || res.locals.element;
                }
                else {
                    data = res.locals[prop];
                }
            }
            if (!data) {
                return next(new Error('Data not found'));
            }
            if (!Array.isArray(data)) {
                data = [data];
            }
            const DATE_RFC2822 = "ddd, DD MMM YYYY HH:mm:ss ZZ";
            let lastUpdatedMoment = moment_1.default().subtract(50, 'years');
            for (let element of data) {
                const updatedAt = element._updatedAt;
                if (!updatedAt) {
                    continue;
                }
                const elementMoment = moment_1.default(updatedAt);
                if (elementMoment.isAfter(lastUpdatedMoment)) {
                    lastUpdatedMoment = elementMoment;
                    lastModifiedResponse = elementMoment.lang('en').format(DATE_RFC2822);
                }
            }
            if (lastModifiedResponse && lastModifiedResponse === lastModifiedRequest) {
                res.setHeader('Cache-Control', 'private, must-revalidate');
                res.sendStatus(304);
            }
            else {
                res.setHeader('Cache-Control', 'private, must-revalidate');
                res.setHeader('Last-Modified', lastModifiedResponse);
                res.send(data);
            }
        };
    }
    static registerCacheLastModified(res, lastModified) {
        if (!res.locals.cacheLastModified) {
            res.locals.cacheLastModified = {};
        }
        res.locals.cacheLastModified.lastModified = lastModified;
    }
}
exports.CacheLastModified = CacheLastModified;
//# sourceMappingURL=cache-last-modified.js.map