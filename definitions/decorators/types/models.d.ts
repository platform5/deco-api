import { TypeDecorator } from './type-decorator';
import { Model } from '../model';
export declare let modelDecorator: TypeDecorator;
export interface DetectedModelRelation {
    fromModel: typeof Model;
    toModel: typeof Model;
    key: string;
    type: 'model' | 'models';
}
export declare let relations: Array<DetectedModelRelation>;
export declare let inputModel: (value: any, options: any, key: string) => any;
export declare let validateModel: (value: any, options: any) => Promise<any>;
export declare const model: (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
export declare let modelsDecorator: TypeDecorator;
export declare let inputModels: (value: any, options: any, key: string) => Promise<any>;
export declare let validateModels: (value: any, options: any) => Promise<any>;
export declare const models: (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
//# sourceMappingURL=models.d.ts.map