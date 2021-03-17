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
const update_query_1 = require("./../helpers/update-query");
const query_1 = require("./../helpers/query");
const datastore_1 = require("../helpers/datastore");
const mongodb_1 = require("mongodb");
const moment_1 = __importDefault(require("moment"));
const aurelia_validator_1 = require("../helpers/aurelia-validator");
const aurelia_validation_1 = require("aurelia-validation");
const file_1 = require("../helpers/file");
const debugModule = require('debug');
const debug = debugModule('deco-api:model');
const warn = debugModule('deco-api:model');
warn.log = console.warn.bind(console);
let defaultModelOptions = {
    acceptOtherFields: false,
    enableStory: false,
    modelName: ''
};
exports.model = (collectionName, options = {}) => {
    options = Object.assign({}, defaultModelOptions, options);
    return function (target) {
        let deco = {
            collectionName: collectionName,
            modelName: options.modelName || collectionName,
            db: datastore_1.datastore.db,
            options: options,
            propertyTypes: target.prototype._types || {},
            propertyTypesOptions: target.prototype._typesOptions || {},
            propertyInputs: target.prototype._inputs || [],
            propertyOutputs: target.prototype._outputs || [],
            propertyToDocuments: target.prototype._toDocuments || [],
            propertyValidations: target.prototype._validations || {},
            propertySearchables: target.prototype._searchables || [],
            propertySortables: target.prototype._sortables || [],
            propertyFilterables: target.prototype._filterables || [],
            propertyFilterablesOptions: target.prototype._filterablesOptions || {}
        };
        target.prototype._deco = deco;
        datastore_1.datastore.isReady().then(() => {
            target.prototype._deco.db = datastore_1.datastore.db;
        });
    };
};
class Model {
    constructor() {
        this.filesToRemove = []; // array of path
    }
    static get deco() {
        return this.prototype._deco;
    }
    get deco() {
        if (this._deco)
            return this._deco;
        warn('Providing deco via prototype: this should be avoided at all cost, please trace why and fix!');
        return Object.getPrototypeOf(this)._deco;
    }
    static getDecoProperties(deco, type = '') {
        let properties = [];
        if (typeof type === 'string')
            type = [type];
        for (let propName in deco.propertyTypes) {
            let typeDec = deco.propertyTypes[propName];
            if (type === [] || type.indexOf(typeDec.name) !== -1)
                properties.push(propName);
        }
        return properties;
    }
    static getAll(query = null, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let deco = (options && options.deco) ? options.deco : this.deco;
            if (query === null)
                query = new query_1.Query();
            if (!datastore_1.datastore.db)
                throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
            const cursor = deco.db.collection(deco.collectionName)
                .find(query.onlyQuery())
                .skip(query.onlySkip())
                .limit(query.onlyLimit())
                .sort(query.onlySort());
            const count = cursor.count();
            return cursor
                .toArray()
                .then((documents) => __awaiter(this, void 0, void 0, function* () {
                let promises = [];
                let ifdOptions = {};
                if (options && options.deco)
                    ifdOptions.deco = options.deco;
                if (documents.length) {
                    for (let document of documents) {
                        promises.push(this.instanceFromDocument(document, ifdOptions));
                    }
                    const elements = yield Promise.all(promises);
                    if (options && options.addCountInKey) {
                        const countValue = yield count;
                        for (let element of elements) {
                            element.set(options.addCountInKey, countValue);
                        }
                    }
                    return elements;
                }
                return Promise.resolve([]);
            }));
        });
    }
    static getOneWithId(id, options) {
        if (!datastore_1.datastore.db)
            throw new Error('[getOneWithId] Missing db (did you call the method before datastore.isReady() ?)');
        if (typeof id === 'string') {
            try {
                id = new mongodb_1.ObjectId(id);
            }
            catch (error) {
                throw new Error('Invalid id');
            }
        }
        let query = { _id: id };
        return this.getOneWithQuery(query, options);
    }
    static getOneWithQuery(query = {}, options) {
        let deco = (options && options.deco) ? options.deco : this.deco;
        if (!datastore_1.datastore.db)
            throw new Error('[getOneWithQuery] Missing db (did you call the method before datastore.isReady() ?)');
        if (query instanceof query_1.Query) {
            query = query.onlyQuery();
        }
        return deco.db.collection(deco.collectionName).find(query).toArray().then((documents) => {
            let promise;
            let ifdOptions = { keepCopyOriginalValues: true };
            if (options && options.deco)
                ifdOptions.deco = options.deco;
            if (documents.length) {
                promise = this.instanceFromDocument(documents[0], ifdOptions).then((element) => {
                    return element.canGetOne().then((authorized) => {
                        if (!authorized)
                            return Promise.reject(new Error('Access denied'));
                        return Promise.resolve(element);
                    });
                });
                return promise;
            }
            return null;
        });
    }
    ;
    getAgain() {
        if (this.model) {
            return this.model.getOneWithId(this._id);
        }
        warn('Model missing this.model, please trace and fix');
        return Object.getPrototypeOf(this).constructor.getOneWithId(this._id);
    }
    insert() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!datastore_1.datastore.db)
                return Promise.reject(new Error('[insert] Missing db (did you call the method before datastore.isReady() ?)'));
            return this.canInsert().then((authorized) => {
                if (!authorized)
                    return Promise.reject(new Error('Permission denied'));
                return this.toDocument('insert');
            }).then((documentToInsert) => {
                return this.deco.db.collection(this.deco.collectionName).insertOne(documentToInsert.getInsertDocument());
            }).then((result) => {
                try {
                    let document = result.ops;
                    if (Array.isArray(document) && document.length === 1)
                        document = document[0];
                    let ifdOptions = {};
                    ifdOptions.deco = this.deco;
                    if (this.model) {
                        return this.model.instanceFromDocument(document, ifdOptions);
                    }
                    warn('this.model missing in .insert(). Please trace and fix');
                    return Object.getPrototypeOf(this).constructor.instanceFromDocument(document, ifdOptions);
                }
                catch (error) {
                    return Promise.reject(error);
                }
            });
        });
    }
    insertMany(quantity = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            if (quantity < 1) {
                throw new Error('Quantity must be greater than 1');
            }
            const int = Math.round(quantity);
            if (int !== quantity) {
                throw new Error('Quantity must be a postive integer');
            }
            if (!datastore_1.datastore.db)
                throw new Error('[insert] Missing db (did you call the method before datastore.isReady() ?)');
            return this.canInsert().then((authorized) => {
                if (!authorized)
                    throw new Error('Permission denied');
                return this.toDocument('insert');
            }).then((documentToInsert) => __awaiter(this, void 0, void 0, function* () {
                const doc = documentToInsert.getInsertDocument();
                const docs = [];
                for (let i = 0; i < quantity; i++) {
                    docs[i] = Object.assign({}, doc);
                    docs[i]._id = new mongodb_1.ObjectId();
                }
                return this.deco.db.collection(this.deco.collectionName).insertMany(docs, { forceServerObjectId: false });
            })).then((result) => __awaiter(this, void 0, void 0, function* () {
                try {
                    let document = result.ops;
                    let ifdOptions = {};
                    ifdOptions.deco = this.deco;
                    if (this.model) {
                        return yield Promise.all(document.map((doc) => __awaiter(this, void 0, void 0, function* () {
                            return yield this.model.instanceFromDocument(doc, ifdOptions);
                        })));
                    }
                    throw new Error('this.model is missing in .insertMany()');
                }
                catch (error) {
                    throw error;
                }
            }));
        });
    }
    insertWithDocument() {
        if (!datastore_1.datastore.db)
            throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
        throw new Error('[insertWithDocument] Not implemented yet');
        //return Promise.resolve(new Model);
    }
    update(properties = []) {
        if (!datastore_1.datastore.db)
            throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
        return this.canUpdate().then((authorized) => {
            if (!authorized)
                throw new Error('Permission denied');
            return this.toDocument('update', properties);
        }).then((documentToUpdate) => {
            return this.deco.db.collection(this.deco.collectionName).findOneAndUpdate({ _id: this._id }, documentToUpdate.getUpdateQuery(), { returnOriginal: false });
        }).then((result) => {
            if (result.ok) {
                if (!result.value)
                    return Promise.resolve(null);
                if (this.filesToRemove && this.filesToRemove.length) {
                    for (let path of this.filesToRemove) {
                        file_1.FileHelper.removeFromDisk(path);
                    }
                }
                let ifdOptions = { keepCopyOriginalValues: true };
                ifdOptions.deco = this.deco;
                if (this.model) {
                    return this.model.instanceFromDocument(result.value, ifdOptions);
                }
                warn('this.model missing in .update(). Please trace and fix');
                return Object.getPrototypeOf(this).constructor.instanceFromDocument(result.value, ifdOptions);
            }
            else {
                return Promise.reject(new Error(result.lastErrorObject));
            }
        });
    }
    /**
     * Compare the element that was retrieve from the database
     * and only update keys that have been changed since
     */
    smartUpdate() {
        throw new Error('[update] Not implemented yet');
    }
    remove() {
        if (!datastore_1.datastore.db)
            throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
        return this.canRemove().then((authorized) => {
            if (!authorized)
                throw new Error('Permission denied');
            return this.deco.db.collection(this.deco.collectionName).deleteOne({ _id: this._id });
        }).then((result) => {
            if (result.result.ok) {
                return true;
            }
            else {
                return false;
            }
        });
    }
    validate(properties = []) {
        // we save the element instance deco in a temporary variable here
        // because in the validation process it could be altered
        // this is for exemple the case in the swissdata dynamicmodel(s) types
        // therefore at the end of the validation process we re-establish
        // the correct deco for the object instance
        let deco = this.deco;
        let rules;
        for (let key in this.deco.propertyTypes) {
            // ignore property not listed in properties if given
            if (properties.length && properties.indexOf(key) === -1)
                continue;
            let type = this.deco.propertyTypes[key];
            let options = this.deco.propertyTypesOptions[key];
            let validation = this.deco.propertyValidations[key] || null;
            rules = (rules || aurelia_validation_1.ValidationRules).ensure(key);
            const ruleOptions = Object.assign({}, options, { key: key, instance: this, target: this.constructor });
            rules = rules.satisfiesRule(`type:${type.name}`, ruleOptions);
            for (let validate of validation || []) {
                if (validate.type === 'required') {
                    rules = rules.required();
                }
                else if (validate.type === 'email') {
                    rules = rules.email();
                }
                else if (validate.type === 'minLength') {
                    rules = rules.minLength(validate.options.minLength);
                }
                else if (validate.type === 'maxLength') {
                    rules = rules.maxLength(validate.options.maxLength);
                }
                else if (validate.type === 'slug') {
                    rules = rules.matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/);
                }
                else {
                    let customRuleOptions = Object.assign({}, ruleOptions, validate.options);
                    rules = rules.satisfiesRule(`validate:${validate.type}`, customRuleOptions);
                }
            }
        }
        if (!rules) {
            this._deco = deco;
            // Object.getPrototypeOf(this)._deco = deco;
            return Promise.resolve(true);
        }
        return aurelia_validator_1.aureliaValidator.validateObject(this, rules.rules).then((result) => {
            // this is where we re-establish the correct deco for this element instance
            // after the validation process is finished
            this._deco = deco;
            // Object.getPrototypeOf(this)._deco = deco;
            // return true if the validation doesn't reject
            return Promise.resolve(true);
        }).catch((error) => {
            console.error(error);
            throw error;
        });
    }
    toDocument(operation, properties = []) {
        // validate before saving
        return this.validate(properties).then(() => {
            // create a data object that will be the document
            let data = new update_query_1.UpdateQuery();
            if (!this.model) {
                warn('this.model missing in .toDocument(). Please trace and fix');
            }
            let target = this.model ? this.model : Object.getPrototypeOf(this);
            // and fill in all keys from the instance that have been requested
            // by the @io.toDocument decorator
            let toDocumentPromises = [];
            for (let property of this.deco.propertyToDocuments) {
                // ignore property not listed in properties if given
                if (properties.length && properties.indexOf(property) === -1)
                    continue;
                let type = this.deco.propertyTypes[property];
                let options = this.deco.propertyTypesOptions[property];
                if (type.requireDeco)
                    options.deco = this.deco;
                let value = this[property];
                toDocumentPromises.push(type.toDocument(data, property, value, operation, options, this, target));
            }
            return Promise.all(toDocumentPromises).then(() => data);
        }).then((data) => {
            // add the _id key if not declared by @io.toDocument but present in instance
            if (this.deco.propertyToDocuments.indexOf('_id') === -1 && this._id) {
                data.set('_id', this._id);
            }
            // register the dating metadata
            data.set('_updatedAt', moment_1.default().toDate());
            data.set('_createdAt', (this._createdAt) ? this._createdAt : moment_1.default().toDate());
            if (this._createdBy) {
                data.set('_createdBy', this._createdBy);
            }
            else if (this.response && this.response.locals.user && this.response.locals.user._id) {
                data.set('_createdBy', this.response.locals.user._id);
            }
            // 08.10.2020
            // It seems that the _updatedBy value is incorrect (most of the time)
            // and it seems it comes from here where we should always update the _updatedBy if we have 
            // the data in the response object
            // if (this._updatedBy) {
            //   data.set('_updatedBy', this._updatedBy);
            // } else if (this.response && this.response.locals.user && this.response.locals.user._id) {
            if (this.response && this.response.locals.user && this.response.locals.user._id) {
                data.set('_updatedBy', this.response.locals.user._id);
            }
            return Promise.resolve(data);
        });
    }
    output(includeProps, ignoreIO = false, includeExtraKeys = []) {
        let data = {};
        if (!this.model) {
            warn('this.model missing in .output(). Please trace and fix');
        }
        let target = this.model ? this.model : Object.getPrototypeOf(this);
        data.id = this._id;
        data._createdAt = this._createdAt;
        data._createdBy = this._createdBy;
        data._updatedAt = this._updatedAt;
        data._updatedBy = this._updatedBy;
        if (!this.deco.propertyOutputs)
            return Promise.resolve(data);
        let outputPromises = [];
        let propSet = ignoreIO ? Object.keys(this.deco.propertyTypes) : [].concat(this.deco.propertyOutputs);
        propSet.push(...includeExtraKeys);
        for (let outputKey of propSet) {
            if (includeExtraKeys.indexOf(outputKey) !== -1) {
                // include this extra value without output
                data[outputKey] = this[outputKey];
                continue;
            }
            if (includeProps && includeProps.indexOf(outputKey) === -1)
                continue;
            // determine the key type
            let type = this.deco.propertyTypes[outputKey];
            if (!type) {
            }
            let options = this.deco.propertyTypesOptions[outputKey];
            if (type.requireDeco)
                options.deco = this.deco;
            let value = this[outputKey];
            outputPromises.push(type.output(outputKey, value, options, this, target).then((value) => {
                data[outputKey] = value;
            }));
        }
        return Promise.all(outputPromises).then(() => {
            if (this._refLocales)
                data._refLocales = this._refLocales;
            return data;
        });
    }
    static outputList(elements, includeProps, ignoreIO = false, includeExtraKeys = []) {
        let promises = [];
        for (let element of elements) {
            promises.push(element.output(includeProps, ignoreIO, includeExtraKeys));
        }
        return Promise.all(promises);
    }
    static instanceFromDocument(document, options = { keepCopyOriginalValues: false }) {
        if (!datastore_1.datastore.db)
            throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
        let element = new this;
        element.model = this;
        if (options && options.deco) {
            // fix element deco
            // Object.getPrototypeOf(element)._deco = options.deco;
            element._deco = options.deco;
        }
        for (let key of element.deco.propertyToDocuments) {
            element[key] = document[key];
            if (options.keepCopyOriginalValues)
                element[`_original${key}`] = document[key];
        }
        if (document._id)
            element._id = document._id;
        if (document._createdAt)
            element._createdAt = document._createdAt;
        if (document._createdBy)
            element._createdBy = document._createdBy;
        if (document._updatedAt)
            element._updatedAt = document._updatedAt;
        if (document._updatedBy)
            element._updatedBy = document._updatedBy;
        return Promise.resolve(element);
    }
    static decoFromRequest(req, res) {
        return this.deco;
    }
    decoFromRequest(req, res) {
        return this.deco;
    }
    static instanceFromRequest(req, res) {
        if (!datastore_1.datastore.db)
            throw new Error('[instanceFromRequest] Missing db (did you call the method before datastore.isReady() ?)');
        // identify the constructor prototype to find out how the class has been decorated
        let deco = this.decoFromRequest(req, res);
        let target = this.prototype;
        let body = req.body || req.query || {};
        let element = new this;
        element.model = this;
        // Object.getPrototypeOf(element)._deco = deco;
        element._deco = deco;
        // keeping the request in the instance for further context use
        element.request = req;
        element.response = res;
        if (body.id) {
            try {
                element._id = new mongodb_1.ObjectId(body.id);
            }
            catch (e) {
                // no error
            }
        }
        if (!deco.propertyInputs)
            return Promise.resolve(element);
        let inputPromises = [];
        for (let bodyKey in body) {
            // ignore keys that have not been flaged as input by the @io.input decorator
            if (deco.propertyInputs.indexOf(bodyKey) === -1)
                continue;
            // determine the key type
            let type = deco.propertyTypes[bodyKey];
            let options = deco.propertyTypesOptions[bodyKey];
            if (type.requireDeco)
                options.deco = this.deco;
            inputPromises.push(type.input(bodyKey, body[bodyKey], options, element, target).then((value) => {
                element[bodyKey] = value;
            }));
        }
        return Promise.all(inputPromises).then(() => {
            return element;
        });
    }
    updateInstanceFromRequest(req, res) {
        let deco = this.decoFromRequest(req, res);
        // update this._deco;
        // Object.getPrototypeOf(this)._deco = deco;
        this._deco = deco;
        if (!deco.db)
            throw new Error('[updateInstanceFromRequest] Missing db (did you call the method before datastore.isReady() ?)');
        // keeping the request in the instance for further context use
        this.request = req;
        this.response = res;
        // identify the constructor prototype to find out how the class has been decorated
        if (!this.model) {
            warn('this.model missing in .updateInstanceFromRequest(). Please trace and fix');
        }
        let target = this.model ? this.model : Object.getPrototypeOf(this);
        let body = req.body || req.query || {};
        if (!deco.propertyInputs)
            return Promise.resolve(this);
        let inputPromises = [];
        for (let bodyKey in body) {
            // ignore keys that have not been flaged as input by the @io.input decorator
            if (deco.propertyInputs.indexOf(bodyKey) === -1)
                continue;
            // determine the key type
            let type = deco.propertyTypes[bodyKey];
            let options = deco.propertyTypesOptions[bodyKey];
            inputPromises.push(type.input(bodyKey, body[bodyKey], options, this, target).then((value) => {
                this[bodyKey] = value;
            }));
        }
        return Promise.all(inputPromises).then(() => {
            return this;
        });
    }
    get(propertyName) {
        return this[propertyName];
    }
    set(propertyName, value) {
        this[propertyName] = value;
    }
    canGetOne(options) { return Promise.resolve(true); }
    canInsert(options) { return Promise.resolve(true); }
    canUpdate(options) { return Promise.resolve(true); }
    canRemove(options) { return Promise.resolve(true); }
}
exports.Model = Model;
Model.collectionName = 'data';
//# sourceMappingURL=model.js.map