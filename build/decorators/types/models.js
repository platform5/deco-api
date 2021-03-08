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
const type_decorator_1 = require("./type-decorator");
const mongodb_1 = require("mongodb");
const model_1 = require("../model");
const query_1 = require("../../helpers/query");
let debug = require('debug')('deco-api:decorators:types:models');
exports.modelDecorator = new type_decorator_1.TypeDecorator('model');
exports.relations = [];
exports.modelDecorator.defaultOptions = {
    model: 'not-set'
};
exports.modelDecorator.optionsHook = (options, target, key) => {
    if (options.biDirectional && options.model !== 'self') {
        throw new Error('options.biDirectional is only supported on self relations');
    }
    if (options && options.model === 'self')
        options.model = target.constructor;
    return options;
};
exports.modelDecorator.postConfigHook = (options, target, key) => {
    if (options && typeof options.model === 'function' && options.model.getAll) {
        exports.relations.push({
            fromModel: target.constructor,
            toModel: options.model,
            key: key,
            type: 'model'
        });
    }
};
exports.inputModel = (value, options, key) => {
    if (value === '')
        value = null;
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (options.model === 'not-set')
        throw new Error(`Model not set in key (${key})`);
    if (options.model instanceof model_1.Model)
        throw new Error('options.model must be a Model instance');
    if (typeof value === 'string') {
        try {
            value = new mongodb_1.ObjectId(value);
        }
        catch (error) {
            throw new Error(`${value} is an invalid ObjectId`);
        }
    }
    return value;
};
exports.modelDecorator.input = (key, value, options, element, target) => {
    return Promise.resolve(exports.inputModel(value, options, key));
};
exports.modelDecorator.output = (key, value, options, element, target) => {
    if (options.model === 'not-set')
        return Promise.reject(new Error(`Model not set in (${key})`));
    if (options.model instanceof model_1.Model)
        return Promise.reject(new Error('options.model must be a Model instance'));
    if (value && typeof value !== 'string' && value.toString)
        return Promise.resolve(value.toString());
    return Promise.resolve(value);
};
exports.validateModel = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.model === 'not-set' || !options.model)
        return Promise.reject(new Error(`Model not set in (${options.key})`));
    if (options.model instanceof model_1.Model)
        throw new Error('options.model must be a Model instance');
    if (value === undefined || value === null)
        return true;
    // fetch the model relation
    return options.model.getOneWithId(value).then((element) => {
        if (element)
            return true;
        return false;
    });
});
exports.modelDecorator.validate = (value, obj, options) => {
    return exports.validateModel(value, options);
};
exports.model = exports.modelDecorator.decorator();
exports.modelsDecorator = new type_decorator_1.TypeDecorator('models');
exports.modelsDecorator.defaultOptions = {
    model: 'not-set'
};
exports.modelsDecorator.optionsHook = (options, target, key) => {
    if (options && options.model === 'self')
        options.model = target.constructor;
    return options;
};
exports.modelsDecorator.postConfigHook = (options, target, key) => {
    if (options && (options.model instanceof model_1.Model)) {
        exports.relations.push({
            fromModel: target,
            toModel: options.model,
            key: key,
            type: 'models'
        });
    }
};
exports.inputModels = (value, options, key) => {
    if (value === '')
        value = null;
    if (value === 'null')
        value = null;
    if (value === 'undefined')
        value = undefined;
    if (options.model === 'not-set')
        return Promise.reject(new Error(`Model not set in (${key})`));
    if (options.model instanceof model_1.Model)
        return Promise.reject(new Error('options.model must be a Model instance'));
    if (value === 'null' || value === null || value === undefined || value === 'undefined')
        value = [];
    if (typeof value === 'string')
        value = value.split(',');
    if (Array.isArray(value)) {
        try {
            let newValue = [];
            for (let item of value) {
                if (typeof item === 'string') {
                    item = new mongodb_1.ObjectId(item);
                }
                newValue.push(item);
            }
            value = newValue;
        }
        catch (error) {
            return Promise.reject(`${value} contains an invalid ObjectId`);
        }
    }
    return Promise.resolve(value);
};
exports.modelsDecorator.input = (key, value, options, element, target) => {
    return exports.inputModels(value, options, key);
};
exports.modelsDecorator.output = (key, value, options, element, target) => {
    if (options.model === 'not-set')
        return Promise.reject(new Error(`Model not set in (${key})`));
    if (options.model === 'self')
        options.model = target;
    if (options.model instanceof model_1.Model)
        return Promise.reject(new Error('options.model must be a Model instance'));
    if (value === null)
        value = [];
    if (value && Array.isArray(value)) {
        for (let item of value) {
            if (item && typeof item !== 'string' && item.toString)
                item = item.toString();
        }
    }
    return Promise.resolve(value);
};
exports.validateModels = (value, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (options.model === 'not-set' || !options.model)
        return Promise.reject(new Error(`Model not set in (${options.key})`));
    if (options.model instanceof model_1.Model)
        return Promise.reject(new Error('options.model must be a Model instance'));
    if (value === undefined || value === null || value === [])
        return true;
    // fetch the model relations
    return options.model.getAll(new query_1.Query({ _id: { $in: value } })).then((elements) => {
        if (elements.length === value.length)
            return true;
        return false;
    });
});
exports.modelsDecorator.validate = (value, obj, options) => {
    return exports.validateModels(value, options);
};
exports.modelsDecorator.toDocument = (updateQuery, key, value, operation, options, element, target) => __awaiter(void 0, void 0, void 0, function* () {
    const newValue = Array.isArray(value) ? value : [];
    // const originalValue: ObjectId[] = Array.isArray(element[key]) ? element[key] : [];
    if (value === undefined) {
        // no-value, unlink everything
        if (operation === 'insert') {
            // if no value when inserting, not a big deal
            return;
        }
        else {
            if (options.biDirectional) {
                // if no value when updating, remove all links
                const query = {};
                query[key] = element._id;
                const pullQuery = Object.assign({}, query);
                const model = options.model;
                const currentRelatedModels = yield model.getAll(new query_1.Query(query));
                yield model.deco.db.collection(model.deco.collectionName).updateMany({ _id: { $in: currentRelatedModels.map(i => i._id) } }, { $pull: pullQuery });
            }
            updateQuery.unset(key);
        }
    }
    else {
        // when we have a value we must update all links
        if (options.biDirectional) {
            if (!element._id) {
                element._id = new mongodb_1.ObjectId(); // when inserting we might not yet have an _id, let's make sure we have one
            }
            // remove all non-relevant links
            const query = {};
            query[key] = element._id;
            const pullQuery = Object.assign({}, query);
            query._id = { $nin: newValue };
            const model = options.model;
            const relatedModelsToUnlink = yield model.getAll(new query_1.Query(query));
            yield model.deco.db.collection(model.deco.collectionName).updateMany({ _id: { $in: relatedModelsToUnlink.map(i => i._id) } }, { $pull: pullQuery });
            // add all relevant links
            const query2 = {};
            query2[key] = { $nin: [element._id] };
            query2._id = { $in: newValue };
            const addQuery = {};
            addQuery[key] = element._id;
            const relatedModelsToLink = yield model.getAll(new query_1.Query(query2));
            yield model.deco.db.collection(model.deco.collectionName).updateMany({ _id: { $in: relatedModelsToLink.map(i => i._id) } }, { $addToSet: addQuery });
        }
        updateQuery.set(key, value);
    }
    return Promise.resolve();
});
function updateRelatedModel(relatedModel, relatedModelId, elementId, operation) {
    return __awaiter(this, void 0, void 0, function* () {
        return;
    });
}
exports.models = exports.modelsDecorator.decorator();
//# sourceMappingURL=models.js.map