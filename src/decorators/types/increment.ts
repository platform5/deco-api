import { Deco } from './../../interfaces/deco';
import { datastore } from './../../helpers/datastore';
import { StringNumberMap } from './../../interfaces/types';
import { UpdateQuery } from './../../helpers/update-query';
import { TypeDecorator } from './type-decorator';
let debug = require('debug')('deco-api:decorators:types:increment');

export let incrementDecorator = new TypeDecorator('increment');
incrementDecorator.requireDeco = true;
export let inputIncrement = (value: any, options: any) => {
  return undefined
}
incrementDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputIncrement(value, options));
};
export let validateIncrement = async (value: any, options: any) => {
  return true;
};
incrementDecorator.validate = (value: any, obj: any, options: any) => {
  return validateIncrement(value, options);
};
let counters: StringNumberMap = {};
incrementDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (!options.deco) {
    console.warn('Missing deco in increment decorator');
    return Promise.resolve();
  }
  let deco: Deco = options.deco;
  if (element[key]) return Promise.resolve();
  let counterId = options.deco.collectionName + ':' + key;
  let counterMin = options.min || 1;

  let counterPromise: Promise<Number>;
  if (counters[counterId]) {
    counters[counterId] = counters[counterId] + 1
    counterPromise = Promise.resolve(counters[counterId]);
  } else {
    let projection: any = {};
    projection[key] = 1;
    let sort: any = {};
    sort[key] = -1;
    counterPromise = datastore.db.collection(deco.collectionName).find({}, {projection: projection, sort: sort, limit: 1}).toArray().then((result) => {
      let value: number = counterMin;
      if (result && result.length && result[0][key]) {
        value = Math.max(counterMin, result[0][key]);
      }
      counters[counterId] = value + 1;
      return counters[counterId];
    });
  }
  return counterPromise.then((inc) => {
    updateQuery.set(key, inc);
  });
}
export const increment = incrementDecorator.decorator();