import { Deco } from './../interfaces/deco';
import { datastore } from './../helpers/datastore';
import { StringTMap } from '../interfaces';
let debug = require('debug')('deco-api:decorators:mongo-index');

type MongoIndexDirection = -1 | 1;

interface MongoIndexOptions {
  type?: 'single' | 'compound' | '2dsphere';
  direction?: -1 | 1;
  compoundFields?: StringTMap<MongoIndexDirection>;
  unique?: boolean;
  sparse?: boolean;
  partialFilterExpression?: any;
  expireAfterSeconds?: number | undefined;
}

interface MongoCollectionIndexOptions {
  type: 'text';
  properties?: Array<string>;
}

let defaultOptions: MongoIndexOptions = {
  type: 'single',
  direction: 1,
  compoundFields: {},
  unique: false,
  sparse: false,
  partialFilterExpression: undefined,
  expireAfterSeconds: undefined
};

let index = (options: MongoIndexOptions = {}): any => {
  options = Object.assign({}, defaultOptions, options);
  
  let deco = (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
    if (descriptor) descriptor.writable = true;

    datastore.isReady().then(() => {
      if (target._deco) {
        let deco: Deco = target._deco;
        let indexData: any = {};
        let indexOptions: any = {};
        if (options.type === 'single') {
          debug('Mongo index:', deco.collectionName, key, options.type, options.direction);
          indexData[key] = options.direction;
        } else if (options.type === 'compound') {
          indexData = options.compoundFields;
        } else if (options.type === '2dsphere') {
          indexData[key] = '2dsphere';
        } else if (options.type === 'text') {
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
        if (Object.keys(indexData).length) datastore.db.collection(deco.collectionName).createIndex(indexData, indexOptions);
      }
    });

    if (descriptor) return descriptor;
  };

  return deco;
}

export const collectionIndex = (options: MongoCollectionIndexOptions) => {
  return function (target: any): void {
    const deco: Deco = target.prototype._deco;
    datastore.isReady().then(() => {
      if (options.type === 'text' && Array.isArray(options.properties) && options.properties.length > 0) {
        datastore.db.collection(deco.collectionName).listIndexes().toArray().then((indexes) => {
          let deleteIndexPromise: Promise<any> = Promise.resolve();
          for (let index of indexes) {
            if (index.key && index.key._fts && index.key._fts === 'text') {
              deleteIndexPromise = datastore.db.collection(deco.collectionName).dropIndex(index.name);
            }
          }
          deleteIndexPromise.then(() => {
            let indexData: any = {};
            for (let prop of (options.properties as Array<string>)) {
              indexData[prop] = 'text';
            }
            debug('Mongo text index:', deco.collectionName, options.properties);
            datastore.db.collection(deco.collectionName).createIndex(indexData);
          });
        }).catch((error) => {
          debug('Error when adding collectionIndex', options);
          debug(' - Collection: ', deco.collectionName);
          debug(' - Message: ', error.message);
        });
      }
    });
  }
}

export { index, MongoIndexOptions };