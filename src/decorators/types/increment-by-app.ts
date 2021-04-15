import { Deco, datastore, StringNumberMap, UpdateQuery } from '../../';
import { TypeDecorator } from './type-decorator';
let debug = require('debug')('deco-api:decorators:types:increment-by-app');

export let incrementByAppDecorator = new TypeDecorator('increment-by-app');
incrementByAppDecorator.requireDeco = true;
export let inputIncrementByApp = (value: any, options: any) => {
  return undefined
}
incrementByAppDecorator.input = (key: string, value: any, options: any, target: any) => {
  return Promise.resolve(inputIncrementByApp(value, options));
};
export let validateIncrementByApp = async (value: any, options: any) => {
  return true;
};
incrementByAppDecorator.validate = (value: any, obj: any, options: any) => {
  return validateIncrementByApp(value, options);
};
let counters: StringNumberMap = {};
incrementByAppDecorator.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
  if (!options.deco) {
    console.warn('Missing deco in increment decorator');
    return Promise.resolve();
  }
  let deco: Deco = options.deco;
  if (element[key]) {
    updateQuery.set(key, value);
    return Promise.resolve();
  }
  if (!element.appId) {
    throw new Error('incrementByAppDecorator only works for elements with appId set');
  }
  let appIdString = '';
  try {
    appIdString = element.appId.toString();
  } catch (error) {
    throw new Error('incrementByAppDecorator: invalid appId');
  }
  let counterId = options.deco.collectionName + ':' + appIdString + ':' + key;
  let counterMin = options.min || 1;

  let counterPromise: Promise<Number>;
  if (counters[counterId] && false) {
    counters[counterId] = counters[counterId] + 1
    counterPromise = Promise.resolve(counters[counterId]);
    // At first we wanted to keep this memory counter
    // and add a check on the counter value to make sure it doesn't exists
    // but after working on this I realize it's best to always go through the checker below
  } else {
    let projection: any = {};
    projection[key] = 1;
    let sort: any = {};
    sort[key] = -1;
    counterPromise = datastore.db.collection(deco.collectionName).find({appId: element.appId}, {projection: projection, sort: sort, limit: 1}).toArray().then((result) => {
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
export const incrementByApp = incrementByAppDecorator.decorator();