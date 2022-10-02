"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Settings = void 0;
let debug = require('debug')('deco-api:helpers:settings');
class Settings {
    static locale(req, options) {
        if (req && req.query && req.query.locale)
            return req.query.locale;
        if (options && options.defaultLocale)
            return options.defaultLocale;
        return Settings.defaultLocale;
    }
}
exports.Settings = Settings;
Settings.defaultDateFormat = 'DD-MM-YYYY';
Settings.filePreviewSuffix = '_preview';
Settings.fileRemoveSuffix = '_remove';
Settings.fileSortSuffix = '_sort';
Settings.fileClearSuffix = '_clear';
Settings.defaultLocale = 'fr';
Settings.cryptoKey = 'hewAdviwud52%289ynvsodaDahfbpwitd';
//# sourceMappingURL=settings.js.map