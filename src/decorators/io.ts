
let debug = require('debug')('deco-api:io');


function addTargetInfo(target: any, infoName: string, key: string | number | symbol) {
  if (!target[`_${infoName}`]) target[`_${infoName}`] = [];
  target[`_${infoName}`].push(key);
}

export const input = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetInfo(target, 'inputs', key);
  if (descriptor) return descriptor;
}

export const output = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetInfo(target, 'outputs', key);
  if (descriptor) return descriptor;
}

export const toDocument = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetInfo(target, 'toDocuments', key);
  if (descriptor) return descriptor;
}

export const inout = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  input(target, key, descriptor);
  output(target, key, descriptor);
  if (descriptor) return descriptor;
}

export const all = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  input(target, key, descriptor);
  output(target, key, descriptor);
  toDocument(target, key, descriptor);
  if (descriptor) return descriptor;
}

export const fetch = <T>(target: T, key: keyof T, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  addTargetInfo(target, 'fetch', key);
  if (descriptor) return descriptor;
}