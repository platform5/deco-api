import { UpdateQuery } from './../../helpers/update-query';
import 'aurelia-polyfills';
export declare class TypeDecorator {
    name: string;
    defaultOptions: any;
    requireDeco: boolean;
    input: (key: string, value: any, options: any, element: any, target: any) => Promise<any>;
    output: (key: string, value: any, options: any, element: any, target: any) => Promise<any>;
    toString: (key: string, value: any, options: any, element: any, target: any) => Promise<string>;
    toDocument: (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => Promise<void>;
    validate: (value: any, obj: any, options: any) => boolean | Promise<boolean>;
    private customValidationRuleReady;
    constructor(name: string);
    decorator(): (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
    optionsHook(options: any, target: any, key: any): any;
    postConfigHook(options: any, target: any, key: any): void;
    private createCustomValidationRule;
}
//# sourceMappingURL=type-decorator.d.ts.map