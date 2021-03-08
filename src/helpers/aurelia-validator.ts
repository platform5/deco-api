import 'aurelia-polyfills';
import { initialize } from 'aurelia-pal-nodejs';
import { Container } from 'aurelia-dependency-injection';
import { configure as configureBindingLanguage } from 'aurelia-templating-binding';
import { configure as configureValidation, Validator, Rule, ValidateResult } from 'aurelia-validation';

class AureliaValidator {
  private validator: Validator

  constructor() {
    initialize();
    const container = new Container();
    configureBindingLanguage({ container });
    configureValidation({ container });

    this.validator = container.get(Validator);
  }

  validateObject(object: any, rules: Rule<any, any>[][]): Promise<ValidateResult[]> {
    return this.validator.validateObject(object, rules).then(results => {
      let isValid = results.every(r => r.valid);
      let errors = results.map(r => r.message).filter(m => !!m);

      if (!isValid && errors[0]) throw new Error((errors[0] as string));

      return results;
    });
  }
}

export const aureliaValidator = new AureliaValidator();