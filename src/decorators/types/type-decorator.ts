import { StringTMap } from './../../interfaces/types';
import { UpdateQuery } from './../../helpers/update-query';
// aurelia-validation tips
// https://stackoverflow.com/a/49354106/437725
import 'aurelia-polyfills';
import { ValidationRules } from 'aurelia-validation';
let debug = require('debug')('deco-api:decorators:types:type-decorator');

export class TypeDecorator {

  name: string;
  defaultOptions: any = {};
  requireDeco: boolean = false;
  input: (key: string, value: any, options: any, element: any, target: any) => Promise<any>;
  output: (key: string, value: any, options: any, element: any, target: any) => Promise<any>;
  toString: (key: string, value: any, options: any, element: any, target: any) => Promise<string>;
  toDocument: (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => Promise<void>;
  validate: (value: any, obj: any, options: any) => boolean | Promise<boolean>;

  private customValidationRuleReady = false;

  constructor(name: string) {
    this.name = name;
    this.input = (key: string, value: any, options: any, element: any, target: any) => {
      return Promise.resolve(value);
    };
    this.output = (key: string, value: any, options: any, element: any, target: any) => {
      return Promise.resolve(value);
    };
    this.toString = (key: string, value: any, options: any, element: any, target: any) => {
      if (typeof value === 'string') return Promise.resolve(value);
      if (value.toString && typeof value.toString === 'function') return Promise.resolve(value.toString());
      return Promise.resolve('');
    };
    this.toDocument = (updateQuery: UpdateQuery, key: string, value: any, operation: 'insert' | 'update' | 'upsert', options: any, element: any, target: any) => {
      if (value === undefined) {
        if (operation === 'insert') {
          return Promise.resolve();
        } else {
          updateQuery.unset(key);
        }
      } else {
        updateQuery.set(key, value);
      }
      return Promise.resolve();
    };
    this.validate = (value: any, obj: any, options: any) => {
      return true;
    }
  }

  decorator() {
    if (!this.customValidationRuleReady) {
      this.createCustomValidationRule();
      this.customValidationRuleReady = true;
    }

    return (optionsOrTarget?: any, key?: string, descriptor?: PropertyDescriptor): any => {
      let options = {};
      if (key) {
        // used without parameters
        options = Object.assign(options, this.defaultOptions);
      } else {
        options = Object.assign(options, this.defaultOptions, optionsOrTarget);
      }

      let deco = (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
        if (descriptor) descriptor.writable = true;
        if (!target._types) {
          target._types = setBaseModelTypes();
        }
        if (!target._typesOptions) target._typesOptions = {};
        target._types[key] = this;
        target._typesOptions[key] = this.optionsHook(options, target, key);
        this.postConfigHook(options, target, key);
        if (descriptor) return descriptor;
      };

      if (key) {
        return deco(optionsOrTarget, key, descriptor);
      } else {
        return deco;
      }
    }
  }

  public optionsHook(options: any, target: any, key: any) {
    return options;
  }

  public postConfigHook(options: any, target: any, key: any): void {
    return;
  }

  private createCustomValidationRule() {
    ValidationRules.customRule(
      `type:${this.name}`,
      this.validate,
      `The \${$propertyName} property is not valid (${this.name})`
    );
  }

}

import { idDecorator, dateDecorator } from '../types/basics';

function setBaseModelTypes(): StringTMap<TypeDecorator> {
  return {
    _id: idDecorator,
    _createdAt: dateDecorator,
    _updatedAt: dateDecorator,
    _createdBy: idDecorator,
    _updatedBy: idDecorator
  };
}