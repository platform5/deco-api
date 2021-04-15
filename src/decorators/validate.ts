import { ValidationRules } from 'aurelia-validation';
import { Request } from 'express';
import { Model } from './model';
let debug = require('debug')('deco-api:decorators:validate');

export { ValidationRules };

export interface PropertyValidation {
  type: string,
  options: any;
}

export function addTargetValidation(target: any, type: string, key: string | number | symbol, options = {}) {

  if (!target._validations) target._validations = {};
  if (!target._validations[key]) target._validations[key] = [];

  let validation: PropertyValidation = {
    type: type,
    options: options
  };

  target._validations[key].push(validation);
}

export const required = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetValidation(target, 'required', key);
  if (descriptor) return descriptor;
}

export const minLength = (minLength: number = 0) => {
  return <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
    if (descriptor) descriptor.writable = true;
    addTargetValidation(target, 'minLength', key, {minLength: minLength});
    if (descriptor) return descriptor;
  };
}

export const maxLength = (maxLength: number = 0) => {
  return <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
    if (descriptor) descriptor.writable = true;
    addTargetValidation(target, 'maxLength', key, {maxLength: maxLength});
    if (descriptor) return descriptor;
  };
}

export const email = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetValidation(target, 'email', key);
  if (descriptor) return descriptor;
};

export const slug = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetValidation(target, 'slug', key);
  if (descriptor) return descriptor;
};


export const uniqueByApp = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetValidation(target, 'uniqueByApp', key);
  if (descriptor) return descriptor;
}

ValidationRules.customRule(
  `validate:uniqueByApp`,
  (value: any, obj: any, options: any) => {
    if (value === null || value === undefined || value === '') return true;
    let query: any = {};
    query[options.key] = value;
    query._id = {$ne: options.instance._id};
    if (options.instance.appId) {
      query.appId = options.instance.appId
    } else if (options.instance.request && options.instance.request.body) {
      let req: Request = options.instance.request;
      query.appId = req?.body?.appId;
    }
    return (options.target as typeof Model).getOneWithQuery(query).then((element) => {
      if (element) return false;
      return true;
    });
  },
  `This \${$propertyName} already exists`
);