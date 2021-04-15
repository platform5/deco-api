import { UpdateQuery } from './../../helpers/update-query';
import { TypeDecorator } from './type-decorator';
import { ObjectId } from 'mongodb';
import { Model } from '../model';
import { Query } from '../../helpers/query';
import { decorators } from 'aurelia-metadata';
let debug = require('debug')('deco-api:decorators:types:models');
export let modelDecorator = new TypeDecorator('model');

export interface DetectedModelRelation {
  fromModel: typeof Model;
  toModel: typeof Model;
  key: string;
  type: 'model' | 'models';
}

export let relations: Array<DetectedModelRelation> = [];

modelDecorator.defaultOptions = {
  model: 'not-set'
}
modelDecorator.optionsHook = (options: any, target: any, key: string) => {
  if (options.biDirectional && options.model !== 'self') {
    throw new Error('options.biDirectional is only supported on self relations');
  }
  if (options.crossDirectional && options.model !== 'self') {
    throw new Error('options.crossDirectional is only supported on self relations');
  }
  if (options && options.model === 'self') options.model = target.constructor;
  return options;
}
modelDecorator.postConfigHook = (options: any, target: any, key: string) => {
  if (options && typeof options.model === 'function' && options.model.getAll) {
    relations.push({
      fromModel: target.constructor,
      toModel: options.model,
      key: key,
      type: 'model'
    });
  }
}
export let inputModel = (value: any, options: any, key: string) => {
  if (value === '') value = null;
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (options.model === 'not-set') throw new Error(`Model not set in key (${key})`);
  if (options.model !instanceof Model) throw new Error('options.model must be a Model instance');
  if (typeof value === 'string') {
    try {
      value = new ObjectId(value);
    } catch (error) {
      throw new Error(`${value} is an invalid ObjectId`);
    }
  }
  return value;
};
modelDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return Promise.resolve(inputModel(value, options, key));
};
modelDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  if (options.model === 'not-set') return Promise.reject(new Error(`Model not set in (${key})`));
  if (options.model !instanceof Model) return Promise.reject(new Error('options.model must be a Model instance'));
  if (value && typeof value !== 'string' && value.toString) return Promise.resolve(value.toString());
  return Promise.resolve(value);
};
export let validateModel = async (value: any, options: any) => {
  if (options.model === 'not-set' || !options.model) return Promise.reject(new Error(`Model not set in (${options.key})`));
  if (options.model !instanceof Model) throw new Error('options.model must be a Model instance');

  if (value === undefined || value === null) return true;

  // fetch the model relation
  return options.model.getOneWithId(value).then((element: Model) => {
    if (element) return true;
    return false;
  });
};
modelDecorator.validate = (value: any, obj: any, options: any) => {
  return validateModel(value, options);
};

export const model = modelDecorator.decorator();

export let modelsDecorator = new TypeDecorator('models');
modelsDecorator.defaultOptions = {
  model: 'not-set'
}
modelsDecorator.optionsHook = (options: any, target: any, key: string) => {
  if (options && options.model === 'self') options.model = target.constructor;
  return options;
}
modelsDecorator.postConfigHook = (options: any, target: any, key: string) => {
  if (options && (options.model instanceof Model)) {
    relations.push({
      fromModel: target,
      toModel: options.model,
      key: key,
      type: 'models'
    });
  }
}
export let inputModels = (value: any, options: any, key: string) => {
  if (value === '') value = null;
  if (value === 'null') value = null;
  if (value === 'undefined') value = undefined;
  if (options.model === 'not-set') return Promise.reject(new Error(`Model not set in (${key})`));
  if (options.model !instanceof Model) return Promise.reject(new Error('options.model must be a Model instance'));

  if (value === 'null' || value === null || value === undefined || value === 'undefined') value = [];

  if (typeof value === 'string') value = value.split(',');

  if (Array.isArray(value)) {
    try {
      let newValue = [];
      for (let item of value) {
        if (typeof item === 'string') {
          item = new ObjectId(item);
        }
        newValue.push(item);
      }
      value = newValue;
    } catch (error) {
      return Promise.reject(`${value} contains an invalid ObjectId`);
    }
  }
  return Promise.resolve(value);
}
modelsDecorator.input = (key: string, value: any, options: any, element: any, target: any) => {
  return inputModels(value, options, key);
};
modelsDecorator.output = (key: string, value: any, options: any, element: any, target: any) => {
  if (options.model === 'not-set') return Promise.reject(new Error(`Model not set in (${key})`));
  if (options.model === 'self') options.model = target;
  if (options.model !instanceof Model) return Promise.reject(new Error('options.model must be a Model instance'));
  if (value === null) value = [];
  if (value && Array.isArray(value)) {
    for (let item of value) {
      if (item && typeof item !== 'string' && item.toString) item = item.toString();
    }
  }
  return Promise.resolve(value);
};
export let validateModels = async (value: any, options: any) => {
  if (options.model === 'not-set' || !options.model) return Promise.reject(new Error(`Model not set in (${options.key})`));
  if (options.model !instanceof Model) return Promise.reject(new Error('options.model must be a Model instance'));

  if (value === undefined || value === null || value === []) return true;

  // fetch the model relations
  return options.model.getAll(new Query({_id: {$in: value}})).then((elements: Array<Model>) => {
    if (elements.length === value.length) return true;
    return false;
  });
};
modelsDecorator.validate = (value: any, obj: any, options: any) => {
  return validateModels(value, options);
};
modelsDecorator.toDocument = async (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  const newValue: ObjectId[] = Array.isArray(value) ? value : [];
  // const originalValue: ObjectId[] = Array.isArray(element[key]) ? element[key] : [];

  if (options.crossDirectional) {
    const model = (options.model as typeof Model);
    if (operation !== 'insert' && value === undefined || (Array.isArray(value) && value.length === 0)) {
      // remove this item from any relationship on this key
      const query: any = {};
      query[key] = element._id;
      const pullQuery = Object.assign({}, query);
      const currentRelatedModels = await model.getAll(new Query(query));
      await model.deco.db.collection(model.deco.collectionName).updateMany({_id: {$in: currentRelatedModels.map(i => i._id)}}, {$pull: pullQuery});
    } else if (Array.isArray(value)) {
      // first thing: compare which relationships have been removed in this operation
      // for this we compare between the value requested as new value and the
      // currently stored value
      if (operation === 'insert' && !element._id) {
        element._id = new ObjectId();
      }
      const originalValue = element[`_original${key}`] || [];
      const idsNotToAdd: string[] = originalValue.map((id: any) => id.toString());
      // must fetch all related elements and check if we must add some more ids into the relation
      // for this we only query "new" elements that were not in the relationship before
      // also we will not add any 
      const valuesString = value.map(v => v.toString());
      const related = await model.deco.db.collection(model.deco.collectionName).find({_id: {$in: value, $nin: originalValue}}).toArray();
      for (const r of related) {
        if (Array.isArray(r[key])) {
          for (const rr of r[key])  {
            if (!valuesString.includes(rr.toString()) && !idsNotToAdd.includes(rr.toString())) {
              valuesString.push(rr.toString());
              value.push(rr);
            }
          }
        }
      } 
      // value is now a ObjectId[] with all valid relationships
      if (!valuesString.includes(element._id.toString())) {
        valuesString.push(element._id.toString());
        value.push(element._id);
      }
      const setQuery: any = {};
      setQuery[key] = value;
      const unsetMatch: any = {_id: {$nin: value}};
      unsetMatch[key] = {$in: value};
      const unsetQuery: any = {};
      unsetQuery[key] = [];
      await model.deco.db.collection(model.deco.collectionName).updateMany({_id: {$in: value}}, {$set: setQuery});
      // and remove all these values from any other documents that might be linked to it
      await model.deco.db.collection(model.deco.collectionName).updateMany(unsetMatch, {$set: unsetQuery});
      updateQuery.set(key, value);
    }
  }


  if (value === undefined) {
    // no-value, unlink everything
    if (operation === 'insert') {
      // if no value when inserting, not a big deal
      return;
    } else {
      if (options.biDirectional) {
        // if no value when updating, remove all links
        const query: any = {};
        query[key] = element._id;
        const pullQuery = Object.assign({}, query);
        const model = (options.model as typeof Model);
        const currentRelatedModels = await model.getAll(new Query(query));
        await model.deco.db.collection(model.deco.collectionName).updateMany({_id: {$in: currentRelatedModels.map(i => i._id)}}, {$pull: pullQuery});
      }
      updateQuery.unset(key);
    }
  } else {
    // when we have a value we must update all links
    if (options.biDirectional) {
      if (!element._id) {
        element._id = new ObjectId(); // when inserting we might not yet have an _id, let's make sure we have one
      }
      // remove all non-relevant links
      const query: any = {};
      query[key] = element._id;
      const pullQuery = Object.assign({}, query);
      query._id = {$nin: newValue};
      const model = (options.model as typeof Model);
      const relatedModelsToUnlink = await model.getAll(new Query(query));
      await model.deco.db.collection(model.deco.collectionName).updateMany({_id: {$in: relatedModelsToUnlink.map(i => i._id)}}, {$pull: pullQuery});
      // add all relevant links
      const query2: any = {};
      query2[key] = {$nin: [element._id]};
      query2._id = {$in: newValue};
      const addQuery: any = {};
      addQuery[key] = element._id;
      const relatedModelsToLink = await model.getAll(new Query(query2));
      await model.deco.db.collection(model.deco.collectionName).updateMany({_id: {$in: relatedModelsToLink.map(i => i._id)}}, {$addToSet: addQuery});
    }
    updateQuery.set(key, value);
  }
  return Promise.resolve();
};

async function updateRelatedModel(relatedModel: typeof Model, relatedModelId: ObjectId, elementId: ObjectId, operation: 'add' | 'remove'): Promise<void> {
  return;
}

export const models = modelsDecorator.decorator();