import { Db, ObjectId } from 'mongodb';
import { ModelOptions, Model } from './../decorators/model';
import { StringAnyMap, StringTMap } from './types';
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
    propertyTypes: StringTMap<TypeDecorator>;
    propertyTypesOptions: StringAnyMap;
    propertyInputs: Array<string>;
    propertyOutputs: Array<string>;
    propertyToDocuments: Array<string>;
    propertyValidations: StringTMap<Array<PropertyValidation>>;
    propertySearchables: Array<string>;
    propertySortables: Array<string>;
    propertyFilterables: Array<string>;
    propertyFilterablesOptions: StringAnyMap;
}
export declare function cloneDeco(deco: Deco): Deco;
//# sourceMappingURL=deco.d.ts.map