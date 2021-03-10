"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_1 = require("./../decorators/model");
const settings_1 = require("../helpers/settings");
const multer_1 = __importDefault(require("multer"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const crypto_1 = __importDefault(require("crypto"));
let debug = require('debug')('deco-api:middlewares:multipart');
let storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        let options = req.filesPropertyOptions;
        let fieldname = file.fieldname;
        if (fieldname.substr(settings_1.Settings.filePreviewSuffix.length * -1) === settings_1.Settings.filePreviewSuffix) {
            fieldname = fieldname.substr(0, fieldname.length - settings_1.Settings.filePreviewSuffix.length);
        }
        if (options && options[fieldname] && options[fieldname].destination && typeof options[fieldname].destination === 'string') {
            mkdirp_1.default.sync(options[fieldname].destination);
            cb(null, options[fieldname].destination);
        }
        else {
            cb(null, 'uploads/');
        }
    },
    filename: function (req, file, cb) {
        crypto_1.default.pseudoRandomBytes(16, function (err, raw) {
            if (err)
                cb(err, '');
            else
                cb(null, raw.toString('hex'));
        });
    }
});
let fileFilter = (req, file, cb) => {
    let options = req.filesPropertyOptions;
    let filter = true;
    let suff = settings_1.Settings.filePreviewSuffix;
    if (file.fieldname.substr(suff.length * -1) === suff) {
        // this is a preview field
        let ok = new RegExp('image/*').test(file.mimetype);
        cb(null, ok);
        return;
    }
    if (!options || !options[file.fieldname] || !options[file.fieldname].accepted) {
        filter = false;
        cb(null, true);
        return;
    }
    if (options && typeof options[file.fieldname].accepted === 'string') {
        options[file.fieldname].accepted = [options[file.fieldname].accepted];
    }
    if (options && Array.isArray(options[file.fieldname].accepted) && filter) {
        let accepted = (options[file.fieldname].accepted || []).join('|');
        accepted = accepted.replace(/\*/g, '.*');
        accepted = accepted.replace(/\//g, '\/');
        accepted = accepted.replace('+', '\\+');
        let ok = new RegExp(accepted).test(file.mimetype);
        cb(null, ok);
        return;
    }
};
let uploadEngine = multer_1.default({ fileFilter: fileFilter, storage: storage });
class MultipartMiddleware {
    static parseDeco(deco, storage = 'fs') {
        if (storage !== 'fs') {
            throw new Error(`Only 'fs' storage is available at the moment`);
        }
        // find all file fields
        let fileProperties = model_1.Model.getDecoProperties(deco, ['file', 'files']);
        // return a middleware setup for uploading files from the file files
        let fieldsConfig = [];
        for (let prop of fileProperties) {
            let maxCount = deco.propertyTypes[prop].name === 'file' ? 1 : 12;
            if (deco.propertyTypes[prop].name === 'files' && deco.propertyTypesOptions[prop] && deco.propertyTypesOptions[prop].maxCount) {
                maxCount = deco.propertyTypesOptions[prop].maxCount;
            }
            fieldsConfig.push({ name: prop, maxCount: maxCount });
            fieldsConfig.push({ name: `${prop}${settings_1.Settings.filePreviewSuffix}`, maxCount: 100 });
        }
        return [
            MultipartMiddleware.filesOptionsInRequest(deco, fileProperties),
            MultipartMiddleware.uploadEngine.fields(fieldsConfig),
            MultipartMiddleware.filesInBody
        ];
    }
    static filesOptionsInRequest(deco, fileProperties) {
        return (req, res, next) => {
            // keep a copy of the original body to restore later
            res.locals._tmpBody = req.body;
            if (!req.filesPropertyOptions)
                req.filesPropertyOptions = {};
            for (let fileProp of fileProperties) {
                req.filesPropertyOptions[fileProp] = deco.propertyTypesOptions[fileProp];
            }
            next();
        };
    }
    static filesInBody(req, res, next) {
        if (!req.files)
            return next();
        if (!req.body)
            req.body = {};
        if (res.locals._tmpBody) {
            for (let key in res.locals._tmpBody) {
                req.body[key] = res.locals._tmpBody[key];
            }
        }
        delete res.locals._tmpBody;
        for (let key in req.body) {
            try {
                let testJsonParse = JSON.parse(req.body[key]);
                req.body[key] = testJsonParse;
            }
            catch (e) {
            }
        }
        for (let fileProp in req.files) {
            req.body[fileProp] = req.files[fileProp];
        }
        next();
    }
}
exports.MultipartMiddleware = MultipartMiddleware;
MultipartMiddleware.uploadEngine = uploadEngine;
//# sourceMappingURL=multipart.js.map