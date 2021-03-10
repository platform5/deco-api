import { ModelOperation } from '../';
export declare class QueryByModel {
    model: string;
    query: any;
    compareModelWithProperty: string;
}
export interface ModelAccessPolicy {
    public?: boolean | string;
    roles?: Array<string>;
    excludeRoles?: Array<string>;
    userIdByProperty?: string | Array<string>;
    queryByModel?: QueryByModel | Array<QueryByModel>;
}
export interface IOPolicy {
    context: 'userIdInProperty' | 'roles' | '*';
    contextValue?: string | Array<string>;
    properties: '*' | 'extractedFrom' | Array<string>;
    propertiesExtractedFrom?: string;
    operation: 'include' | 'exclude';
    ignoreOnPost?: boolean;
}
export interface Policy {
    globalModelPolicy?: ModelAccessPolicy;
    readModelPolicy?: ModelAccessPolicy;
    writeModelPolicy?: ModelAccessPolicy;
    getAllPolicy?: ModelAccessPolicy;
    getOnePolicy?: ModelAccessPolicy;
    postPolicy?: ModelAccessPolicy;
    putPolicy?: ModelAccessPolicy;
    deletePolicy?: ModelAccessPolicy;
    globalIOPolicy?: Array<IOPolicy>;
    inputPolicy?: Array<IOPolicy>;
    outputPolicy?: Array<IOPolicy>;
}
export declare const modelPolicy: (operation: ModelOperation | 'globalModel', policy?: ModelAccessPolicy) => (target: any) => void;
export declare const propertyPolicy: (operation: 'input' | 'output' | 'globalIO', policies: Array<IOPolicy>) => (target: any) => void;
//# sourceMappingURL=policy.d.ts.map