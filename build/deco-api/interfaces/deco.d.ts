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
    propertyTypes: {
        [key: string]: TypeDecorator;
    };
    propertyTypesOptions: {
        [key: string]: any;
    };
    propertyInputs: Array<string>;
    propertyOutputs: Array<string>;
    propertyToDocuments: Array<string>;
    propertyValidations: {
        [key: string]: PropertyValidation[];
    };
    propertySearchables: Array<string>;
    propertySortables: Array<string>;
    propertyFilterables: Array<string>;
    propertyFilterablesOptions: {
        [key: string]: any;
    };
}
export declare function cloneDeco(deco: Deco): Deco;
//# sourceMappingURL=deco.d.ts.map