import { StringAnyMap, StringTMap } from './../interfaces/types';
import { UpdateQuery } from './../helpers/update-query';
import { Query } from './../helpers/query';
import { datastore } from '../helpers/datastore';
import { TypeDecorator } from './types/index';
import { Db, ObjectId, Cursor, AggregationCursor, InsertOneWriteOpResult,  InsertWriteOpResult, FindAndModifyWriteOpResultObject, DeleteWriteOpResultObject } from 'mongodb';
import { Request, Response } from 'express';
import { Deco } from '../interfaces/deco';
import moment from 'moment';
import { aureliaValidator } from '../helpers/aurelia-validator';
import { ValidationRules } from 'aurelia-validation';
import { FileHelper } from '../helpers/file';

const debugModule = require('debug');
const debug = debugModule('deco-api:model');
const warn = debugModule('deco-api:model');
warn.log = console.warn.bind(console);

export type ModelOperation = 'getAll' | 'getOne' | 'post' | 'put' | 'delete';

export interface ModelOptions {
  acceptOtherFields?: boolean;
  enableStory?: boolean;
  modelName?: string;
}

export interface GetAllOptions {
  deco?: Deco;
  addCountInKey?: string;
}

export interface GetOneOptions {
  deco?: Deco
}

export interface InstanceFromDocumentOptions {
  deco?: Deco,
  keepCopyOriginalValues?: boolean;
}

let defaultModelOptions = {
  acceptOtherFields: false,
  enableStory: false,
  modelName: ''
};

export const model = (collectionName: string, options: ModelOptions = {}) => {
  options = Object.assign({}, defaultModelOptions, options);
  return function (target: any): void {

    let deco: Deco = {
      collectionName: collectionName,
      modelName: options.modelName || collectionName,
      db: datastore.db,
      options: options,
      propertyTypes: target.prototype._types || {},
      propertyTypesOptions: target.prototype._typesOptions || {},
      propertyInputs: target.prototype._inputs || [],
      propertyOutputs: target.prototype._outputs || [],
      propertyToDocuments: target.prototype._toDocuments || [],
      propertyValidations: target.prototype._validations || {},
      propertySearchables: target.prototype._searchables || [],
      propertySortables: target.prototype._sortables || [],
      propertyFilterables: target.prototype._filterables || [],
      propertyFilterablesOptions: target.prototype._filterablesOptions || {}
    };

    target.prototype._deco = deco;

    datastore.isReady().then(() => {
      target.prototype._deco.db = datastore.db;
    });
  }
}

export class Model {
  static collectionName: string = 'data';
  static db: Db;
  static options: ModelOptions;
  model?: typeof Model;
  request: Request;
  response: Response;

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public _id: ObjectId;

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public _createdAt: Date;

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public _updatedAt: Date;

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public _createdBy: ObjectId;

  // DO NOT DECORATE
  // Decoarting the property in the base class can corrupt the inherited classes
  // Please use the model_types property in type-decorator.ts to set the main class type properties
  public _updatedBy: ObjectId;

  public filesToRemove: Array<string> = []; // array of path

  private _refLocales?: StringTMap<StringAnyMap>;

  private _deco: Deco;

  static get deco(): Deco {
    return (this.prototype as any)._deco;
  }

  get deco(): Deco {
    if (this._deco) return this._deco;
    warn('Providing deco via prototype: this should be avoided at all cost, please trace why and fix!');
    return Object.getPrototypeOf(this)._deco;
  }

  static getDecoProperties(deco: Deco, type: string | Array<string> = '') {
    let properties = [];
    if (typeof type === 'string') type = [type];
    for (let propName in deco.propertyTypes) {
      let typeDec: TypeDecorator = deco.propertyTypes[propName];
      if (type === [] || type.indexOf(typeDec.name) !== -1) properties.push(propName);
    }
    return properties;
  }

  static async getAll<T extends typeof Model>(this: T, query: Query | null = null, options?: GetAllOptions, req?: Request, res?: Response): Promise<Array<InstanceType<T>>> {
    let deco = (options && options.deco) ? options.deco : this.deco;
    if (query === null) query = new Query();
    if (!datastore.db) throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
    const {cursor, count} = await this.getAllCursorAndcount(query, deco, req, res);
    // const cursor = deco.db.collection(deco.collectionName)
    //   .find(query.onlyQuery())
    //   .skip(query.onlySkip())
    //   .limit(query.onlyLimit())
    //   .sort(query.onlySort());
    // const count = cursor.count();
    return cursor  
      .toArray()
      .then(async (documents: Array<any>) => {
      let promises = [];
      let ifdOptions: InstanceFromDocumentOptions = {};
      if (options && options.deco) ifdOptions.deco = options.deco;
      if (documents.length) {
        for (let document of documents) {
          promises.push(this.instanceFromDocument(document, ifdOptions));
        }
        const elements = await Promise.all(promises);
        if (options && options.addCountInKey) {
          const countValue = count;
          for (let element of elements) {
            element.set(options.addCountInKey, countValue);
          }
        }
        return elements;
      }
      return Promise.resolve([]);
    });
  }

  static async getAllCursorAndcount(query: Query, deco: Deco, req?: Request, res?: Response): Promise<{cursor: Cursor<any> | AggregationCursor<any>, count: number}> {  
    const cursor = deco.db.collection(deco.collectionName)
      .find(query.onlyQuery())
      .skip(query.onlySkip())
      .limit(query.onlyLimit())
      .sort(query.onlySort());
    const count = await cursor.count();
    return {cursor, count};
  }

  static getOneWithId<T extends typeof Model>(this: T, id: string | ObjectId, options?: GetOneOptions): Promise<InstanceType<T> | null> {
    if (!datastore.db) throw new Error('[getOneWithId] Missing db (did you call the method before datastore.isReady() ?)');
    if (typeof id === 'string') {
      try {
        id = new ObjectId(id);
      } catch (error) {
        throw new Error('Invalid id');
      }
    }
    let query = {_id: id};
    return this.getOneWithQuery(query, options);
  }

  static getOneWithQuery<T extends typeof Model>(this: T, query: Query | any = {}, options?: GetOneOptions): Promise<InstanceType<T> | null> {
    let deco = (options && options.deco) ? options.deco : this.deco;
    if (!datastore.db) throw new Error('[getOneWithQuery] Missing db (did you call the method before datastore.isReady() ?)');
    if (query instanceof Query) {
      query = query.onlyQuery();
    }
    return deco.db.collection(deco.collectionName).find(query).toArray().then((documents: Array<any>) => {
      let promise: Promise<any>;
      let ifdOptions: InstanceFromDocumentOptions = {keepCopyOriginalValues: true};
      if (options && options.deco) ifdOptions.deco = options.deco;
      if (documents.length) {
        promise = this.instanceFromDocument(documents[0], ifdOptions).then((element) => {
          return element.canGetOne().then((authorized: any): Promise<any> => {
            if (!authorized) return Promise.reject(new Error('Access denied'));
            return Promise.resolve(element);
          });
        });
        return promise;
      }
      return null;
    });
  };

  getAgain<T extends Model>(this: T): Promise<T | null> {
    if (this.model) {
      return this.model.getOneWithId(this._id) as Promise<T | null>;
    }
    warn('Model missing this.model, please trace and fix');
    return Object.getPrototypeOf(this).constructor.getOneWithId(this._id);
  }
  
  public async insert() { 
    if (!datastore.db) return Promise.reject(new Error('[insert] Missing db (did you call the method before datastore.isReady() ?)'));
    return this.canInsert().then((authorized: any): Promise<any> =>{
      if (!authorized) return Promise.reject(new Error('Permission denied'));
      return this.toDocument('insert');
    }).then((documentToInsert): Promise<InsertOneWriteOpResult<any>> => {
        return this.deco.db.collection(this.deco.collectionName).insertOne(documentToInsert.getInsertDocument());
    }).then((result) => {
      try {
        let document = result.ops;
        if (Array.isArray(document) && document.length === 1) document = document[0];
        let ifdOptions: InstanceFromDocumentOptions = {};
        ifdOptions.deco = this.deco;
        if (this.model) {
          return this.model.instanceFromDocument(document, ifdOptions);
        }
        warn('this.model missing in .insert(). Please trace and fix');
        return Object.getPrototypeOf(this).constructor.instanceFromDocument(document, ifdOptions);
      } catch (error) {
        return Promise.reject(error);
      }
    });
  }

  public async insertMany(quantity = 1): Promise<any[]> {
    if (quantity < 1) {
      throw new Error('Quantity must be greater than 1');
    }
    const int = Math.round(quantity);
    if (int !== quantity) {
      throw new Error('Quantity must be a postive integer');
    }    
    if (!datastore.db) throw new Error('[insert] Missing db (did you call the method before datastore.isReady() ?)');
    return this.canInsert().then((authorized) =>{
      if (!authorized) throw new Error('Permission denied');
      return this.toDocument('insert');
    }).then(async (documentToInsert: any): Promise<InsertWriteOpResult<any>> => {
      const doc = documentToInsert.getInsertDocument();
      const docs: any[] = [];
      for (let i = 0; i < quantity; i++) {
        docs[i] = Object.assign({}, doc);
        docs[i]._id = new ObjectId();
      }
      return this.deco.db.collection(this.deco.collectionName).insertMany(docs, {forceServerObjectId: false});
    }).then(async (result: any) => {
      try {
        let document = result.ops;
        let ifdOptions: InstanceFromDocumentOptions = {};
        ifdOptions.deco = this.deco;
        if (this.model) {
          return await Promise.all(document.map(async (doc: any) => {
            return await (this.model as typeof Model).instanceFromDocument(doc, ifdOptions);
          }));
        }
        throw new Error('this.model is missing in .insertMany()');
      } catch (error) {
        throw error;
      }
    });
  }

  public insertWithDocument<T extends Model>(this: T): Promise<T> {
    if (!datastore.db) throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
    throw new Error('[insertWithDocument] Not implemented yet')
    //return Promise.resolve(new Model);
  }

  public update<T extends Model>(this: T, properties: Array<string> = []): Promise<T> {
    if (!datastore.db) throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
    return this.canUpdate().then((authorized) =>{
      if (!authorized) throw new Error('Permission denied');
      return this.toDocument('update', properties);
    }).then((documentToUpdate) => {
      return this.deco.db.collection(this.deco.collectionName).findOneAndUpdate({_id: this._id}, documentToUpdate.getUpdateQuery(), {returnOriginal: false});
    }).then((result: FindAndModifyWriteOpResultObject<any>) => {
      if (result.ok) {
        if (!result.value) return Promise.resolve(null);
        if (this.filesToRemove && this.filesToRemove.length) {
          for (let path of this.filesToRemove) {
            FileHelper.removeFromDisk(path);
          }
        }
        let ifdOptions: InstanceFromDocumentOptions = {keepCopyOriginalValues: true};
        ifdOptions.deco = this.deco;
        if (this.model) {
          return this.model.instanceFromDocument(result.value, ifdOptions);
        }
        warn('this.model missing in .update(). Please trace and fix');
        return Object.getPrototypeOf(this).constructor.instanceFromDocument(result.value, ifdOptions);
      } else {
        return Promise.reject(new Error(result.lastErrorObject))
      }
    });
  }

  /**
   * Compare the element that was retrieve from the database
   * and only update keys that have been changed since
   */
  public smartUpdate<T extends Model>(this: T): Promise<T> {
    throw new Error('[update] Not implemented yet')
  }

  public remove(): Promise<boolean> {
    if (!datastore.db) throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');

    return this.canRemove().then((authorized) =>{
      if (!authorized) throw new Error('Permission denied');
      return this.deco.db.collection(this.deco.collectionName).deleteOne({_id: this._id});
    }).then((result: DeleteWriteOpResultObject) => {
      if (result.result.ok) {
        return true;
      } else {
        return false;
      }
    });
  }

  public validate(properties: Array<string> = []): Promise<boolean> {
    // we save the element instance deco in a temporary variable here
    // because in the validation process it could be altered
    // this is for exemple the case in the swissdata dynamicmodel(s) types
    // therefore at the end of the validation process we re-establish
    // the correct deco for the object instance
    let deco: Deco = this.deco;
    let rules: any;
    for (let key in this.deco.propertyTypes) {
      // ignore property not listed in properties if given
      if (properties.length && properties.indexOf(key) === -1) continue;
      let type:TypeDecorator = this.deco.propertyTypes[key];
      let options: any = this.deco.propertyTypesOptions[key];
      let validation = this.deco.propertyValidations[key] || null;
      rules = (rules || ValidationRules).ensure(key);
      const ruleOptions = Object.assign({}, options, {key: key, instance: this, target: this.constructor});
      rules = rules.satisfiesRule(`type:${type.name}`, ruleOptions);
      for (let validate of validation || []) {
        if (validate.type === 'required') {
          rules = rules.required();
        }  else if (validate.type === 'email') {
          rules = rules.email();
        } else if (validate.type === 'minLength') {
          rules = rules.minLength(validate.options.minLength);
        }  else if (validate.type === 'maxLength') {
          rules = rules.maxLength(validate.options.maxLength);
        } else if (validate.type === 'slug') {
          rules = rules.matches(/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/);
        } else {
          let customRuleOptions = Object.assign({}, ruleOptions, validate.options);
          rules = rules.satisfiesRule(`validate:${validate.type}`, customRuleOptions);
        }
      }
    }

    if (!rules) {
      this._deco = deco;
      // Object.getPrototypeOf(this)._deco = deco;
      return Promise.resolve(true)
    }
    
    return aureliaValidator.validateObject(this, rules.rules).then((result) => {
      // this is where we re-establish the correct deco for this element instance
      // after the validation process is finished
      this._deco = deco;
      // Object.getPrototypeOf(this)._deco = deco;
      // return true if the validation doesn't reject
      return Promise.resolve(true);
    }).catch((error) => {
      console.error(error);
      throw error;
    })
  }

  toDocument(operation: 'insert' | 'update' | 'upsert', properties: Array<string> = []): Promise<UpdateQuery> {
    // validate before saving
    return this.validate(properties).then(() => {
      // create a data object that will be the document
      let data = new UpdateQuery();
      if (!this.model) {
        warn('this.model missing in .toDocument(). Please trace and fix');
      }
      let target = this.model ? this.model : Object.getPrototypeOf(this);
      // and fill in all keys from the instance that have been requested
      // by the @io.toDocument decorator
      let toDocumentPromises = [];
      for (let property of this.deco.propertyToDocuments) {
        // ignore property not listed in properties if given
        if (properties.length && properties.indexOf(property) === -1) continue;
        let type: TypeDecorator = this.deco.propertyTypes[property];
        let options: any = this.deco.propertyTypesOptions[property];
        if (type.requireDeco) options.deco = this.deco;
        let value: any = (this as any)[property];
        toDocumentPromises.push(
          type.toDocument(data, property, value, operation, options, this, target)
        );
      }
      return Promise.all(toDocumentPromises).then(() => data);
    }).then((data) => {
      // add the _id key if not declared by @io.toDocument but present in instance
      if (this.deco.propertyToDocuments.indexOf('_id') === -1 && this._id) {
        data.set('_id', this._id);
      }
    
      // register the dating metadata
      data.set('_updatedAt', moment().toDate());
      data.set('_createdAt', (this._createdAt) ? this._createdAt : moment().toDate());
      if (this._createdBy) {
        data.set('_createdBy', this._createdBy);
      } else if (this.response && this.response.locals.user && this.response.locals.user._id) {
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

  output(includeProps?: Array<string>, ignoreIO: boolean = false, includeExtraKeys: Array<string> = []): Promise<any> {
    let data: any = {};
    if (!this.model) {
      warn('this.model missing in .output(). Please trace and fix');
    }
    let target = this.model ? this.model : Object.getPrototypeOf(this);
    data.id = this._id;
    data._createdAt = this._createdAt;
    data._createdBy = this._createdBy;
    data._updatedAt = this._updatedAt;
    data._updatedBy = this._updatedBy;
    if (!this.deco.propertyOutputs) return Promise.resolve(data);
    let outputPromises: Array<Promise<any>> = [];
    let propSet: Array<string> = ignoreIO ? Object.keys(this.deco.propertyTypes) : ([] as string[]).concat(this.deco.propertyOutputs);
    propSet.push(...includeExtraKeys);
    for (let outputKey of propSet) {
      if (includeExtraKeys.indexOf(outputKey) !== -1) {
        // include this extra value without output
        data[outputKey] = (this as any)[outputKey];
        continue;
      }
      if (includeProps && includeProps.indexOf(outputKey) === -1) continue;
      // determine the key type
      let type: TypeDecorator = this.deco.propertyTypes[outputKey];
      if (!type) {
      }
      let options: any = this.deco.propertyTypesOptions[outputKey];
      if (type.requireDeco) options.deco = this.deco;
      let value: any = (this as any)[outputKey];
      outputPromises.push(
        type.output(outputKey, value, options, this, target).then((value) => {
          data[outputKey] = value;
        })
      );
    }
  
    return Promise.all(outputPromises).then(() => {
      if (this._refLocales) data._refLocales = this._refLocales;
      return data;
    });
  }

  static outputList(elements: Array<Model>, includeProps?: Array<string>, ignoreIO: boolean = false, includeExtraKeys: Array<string> = []): Promise<Array<any>> {
    let promises: Array<Promise<any>> = [];
    for (let element of elements) {
      promises.push(element.output(includeProps, ignoreIO, includeExtraKeys));
    }
    return Promise.all(promises);
  }

  static instanceFromDocument<T extends typeof Model>(this: T, document: any, options: InstanceFromDocumentOptions = {keepCopyOriginalValues: false}): Promise<InstanceType <T>> {
    if (!datastore.db) throw new Error('[getAll] Missing db (did you call the method before datastore.isReady() ?)');
    let element: InstanceType<T> = (new this as InstanceType<T>);
    element.model = this;
    if (options && options.deco) {
      // fix element deco
      // Object.getPrototypeOf(element)._deco = options.deco;
      element._deco = options.deco;
    }

    for (let key of element.deco.propertyToDocuments) {
      (element as any)[key] = document[key];
      if (options.keepCopyOriginalValues) (element as any)[`_original${key}`] = document[key];
    }

    if (document._id) element._id = document._id;
    if (document._createdAt) element._createdAt = document._createdAt;
    if (document._createdBy) element._createdBy = document._createdBy;
    if (document._updatedAt) element._updatedAt = document._updatedAt;
    if (document._updatedBy) element._updatedBy = document._updatedBy;

    return Promise.resolve(element);
  }

  static decoFromRequest(req: Request, res: Response): Deco {
    return this.deco;
  }

  decoFromRequest(req: Request, res: Response): Deco {
    return this.deco;
  }

  static instanceFromRequest<T extends typeof Model>(this: T, req: Request, res: Response): Promise<InstanceType <T>> {
    if (!datastore.db) throw new Error('[instanceFromRequest] Missing db (did you call the method before datastore.isReady() ?)');
    
    // identify the constructor prototype to find out how the class has been decorated
    let deco = this.decoFromRequest(req, res);
    let target = this.prototype;
    let body = req.body || req.query || {};

    let element = (new this as InstanceType<T>);
    element.model = this;
    // Object.getPrototypeOf(element)._deco = deco;
    element._deco = deco;
    // keeping the request in the instance for further context use
    element.request = req;
    element.response = res;
    if (body.id) {
      try {
        element._id = new ObjectId(body.id);
      } catch (e) {
        // no error
      }
    }
    if (!deco.propertyInputs) return Promise.resolve(element);
    let inputPromises = [];
    for (let bodyKey in body) {
      // ignore keys that have not been flaged as input by the @io.input decorator
      if (deco.propertyInputs.indexOf(bodyKey) === -1) continue;
      // determine the key type
      let type: TypeDecorator = deco.propertyTypes[bodyKey];
      let options: any = deco.propertyTypesOptions[bodyKey];
      if (type.requireDeco) options.deco = this.deco;
      
      inputPromises.push(
        type.input(bodyKey, body[bodyKey], options, element, target).then((value) => {
          (element as any)[bodyKey] = value;
        })
      );
    }
  
    return Promise.all(inputPromises).then(() => {
      return element;
    });
  }

  updateInstanceFromRequest<T extends Model>(this: T, req: Request, res: Response): Promise<T> {
    let deco = this.decoFromRequest(req, res);
    // update this._deco;
    // Object.getPrototypeOf(this)._deco = deco;
    this._deco = deco;
    if (!deco.db) throw new Error('[updateInstanceFromRequest] Missing db (did you call the method before datastore.isReady() ?)');
  
    // keeping the request in the instance for further context use
    this.request = req;
    this.response = res;
  
    // identify the constructor prototype to find out how the class has been decorated
    if (!this.model) {
      warn('this.model missing in .updateInstanceFromRequest(). Please trace and fix');
    }
    let target = this.model ? this.model : Object.getPrototypeOf(this);
    let body = req.body || req.query || {};
    if (!deco.propertyInputs) return Promise.resolve(this);
    let inputPromises = [];
    for (let bodyKey in body) {
       // ignore keys that have not been flaged as input by the @io.input decorator
      if (deco.propertyInputs.indexOf(bodyKey) === -1) continue;
      // determine the key type
      let type: TypeDecorator = deco.propertyTypes[bodyKey];
      let options: any = deco.propertyTypesOptions[bodyKey];
      inputPromises.push(
        type.input(bodyKey, body[bodyKey], options, this, target).then((value) => {
          (this as any)[bodyKey] = value;
        })
      );
    }
    return Promise.all(inputPromises).then(() => {
      return this;
    });
  }

  get(propertyName: string) {
    return (this as any)[propertyName];
  }

  set(propertyName: string, value: any) {
    (this as any)[propertyName] = value;
  }

  canGetOne(options?: any): Promise<boolean> {return Promise.resolve(true);}
  canInsert(options?: any): Promise<boolean> {return Promise.resolve(true);}
  canUpdate(options?: any): Promise<boolean> {return Promise.resolve(true);}
  canRemove(options?: any): Promise<boolean> {return Promise.resolve(true);}
}