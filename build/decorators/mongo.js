"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datastore_1 = require("./../helpers/datastore");
let debug = require('debug')('deco-api:decorators:mongo-index');
let defaultOptions = {
    type: 'single',
    direction: 1,
    compoundFields: {},
    unique: false,
    sparse: false,
    partialFilterExpression: undefined,
    expireAfterSeconds: undefined
};
let index = (options = {}) => {
    options = Object.assign({}, defaultOptions, options);
    let deco = (target, key, descriptor) => {
        if (descriptor)
            descriptor.writable = true;
        datastore_1.datastore.isReady().then(() => {
            if (target._deco) {
                let deco = target._deco;
                let indexData = {};
                let indexOptions = {};
                if (options.type === 'single') {
                    debug('Mongo index:', deco.collectionName, key, options.type, options.direction);
                    indexData[key] = options.direction;
                }
                else if (options.type === 'compound') {
                    indexData = options.compoundFields;
                }
                else if (options.type === '2dsphere') {
                    indexData[key] = '2dsphere';
                }
                else if (options.type === 'text') {
                    indexData[key] = 'text';
                }
                if (options.unique) {
                    indexOptions.unique = true;
                }
                if (options.sparse) {
                    indexOptions.sparse = true;
                }
                if (options.partialFilterExpression) {
                    indexOptions.partialFilterExpression = options.partialFilterExpression;
                }
                if (options.expireAfterSeconds) {
                    indexOptions.expireAfterSeconds = options.expireAfterSeconds;
                }
                if (Object.keys(indexData).length)
                    datastore_1.datastore.db.collection(deco.collectionName).createIndex(indexData, indexOptions);
            }
        });
        if (descriptor)
            return descriptor;
    };
    return deco;
};
exports.index = index;
exports.collectionIndex = (options) => {
    return function (target) {
        const deco = target.prototype._deco;
        datastore_1.datastore.isReady().then(() => {
            if (options.type === 'text' && Array.isArray(options.properties) && options.properties.length > 0) {
                datastore_1.datastore.db.collection(deco.collectionName).listIndexes().toArray().then((indexes) => {
                    let deleteIndexPromise = Promise.resolve();
                    for (let index of indexes) {
                        if (index.key && index.key._fts && index.key._fts === 'text') {
                            deleteIndexPromise = datastore_1.datastore.db.collection(deco.collectionName).dropIndex(index.name);
                        }
                    }
                    deleteIndexPromise.then(() => {
                        let indexData = {};
                        for (let prop of options.properties) {
                            indexData[prop] = 'text';
                        }
                        debug('Mongo text index:', deco.collectionName, options.properties);
                        datastore_1.datastore.db.collection(deco.collectionName).createIndex(indexData);
                    });
                }).catch((error) => {
                    debug('Error when adding collectionIndex', options);
                    debug(' - Collection: ', deco.collectionName);
                    debug(' - Message: ', error.message);
                });
            }
        });
    };
};
//# sourceMappingURL=mongo.js.map