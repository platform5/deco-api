import { Db, ObjectId } from 'mongodb';
import { ModelOptions, Model } from './../decorators/model';
import { PropertyValidation } from '../decorators/validate';
import { TypeDecorator } from '../decorators/types/index';

export interface RelatedModel {
  model: typeof Model;
  key: string;
  type: 'model' | 'models';
}

export interface Deco {
  collectionName: string;
  modelName: string;
  modelId?: ObjectId;
  options: ModelOptions;
  db: Db;

  propertyTypes: {[key: string]: TypeDecorator};
  propertyTypesOptions: {[key: string]: any};

  propertyInputs: Array<string>;
  propertyOutputs: Array<string>;
  propertyToDocuments: Array<string>;

  propertyValidations: {[key: string]: PropertyValidation[]};

  propertySearchables: Array<string>;
  propertySortables: Array<string>;
  propertyFilterables: Array<string>;
  propertyFilterablesOptions: {[key: string]: any};
}

export function cloneDeco(deco: Deco): Deco {
  let cloned: Deco = {
    collectionName: deco.collectionName,
    modelName: deco.modelName,
    modelId: deco.modelId ? deco.modelId : undefined,
    options: Object.assign({}, deco.options),
    db: deco.db,

    propertyTypes: Object.assign({}, deco.propertyTypes),
    propertyTypesOptions: Object.assign({}, deco.propertyTypesOptions),

    propertyInputs: ([] as string[]).concat(deco.propertyInputs),
    propertyOutputs: ([] as string[]).concat(deco.propertyOutputs),
    propertyToDocuments: ([] as string[]).concat(deco.propertyToDocuments),

    propertyValidations: Object.assign({}, deco.propertyValidations),

    propertySearchables: ([] as string[]).concat(deco.propertySearchables),
    propertySortables: ([] as string[]).concat(deco.propertySortables),
    propertyFilterables: ([] as string[]).concat(deco.propertyFilterables),
    propertyFilterablesOptions: Object.assign({}, deco.propertyFilterablesOptions)
  };
  return cloned;
}