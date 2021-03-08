import 'aurelia-polyfills';
import { Rule, ValidateResult } from 'aurelia-validation';
declare class AureliaValidator {
    private validator;
    constructor();
    validateObject(object: any, rules: Rule<any, any>[][]): Promise<ValidateResult[]>;
}
export declare const aureliaValidator: AureliaValidator;
export {};
//# sourceMappingURL=aurelia-validator.d.ts.map