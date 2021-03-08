export function addTargetInfo(target: any, typeName: string, key: string | number | symbol, options = {}) {
  if (!target[`_${typeName}`]) target[`_${typeName}`] = [];
  if (!target[`_${typeName}Options`]) target[`_${typeName}Options`] = {};
  target[`_${typeName}`].push(key);
  target[`_${typeName}Options`][key] = options
}

export const searchable = (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  if (!target._searchables) target._searchables = [];
  target._searchables.push(key);
  if (descriptor) return descriptor;
}

export const filterable = (options: any = {type: 'auto'}) => {
  return (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
    if (descriptor) descriptor.writable = true;
    if (!target._filterables) target._filterables = [];
    if (!target._filterablesOptions) target._filterablesOptions = {};
    target._filterables.push(key);
    target._filterablesOptions[key] = options;
    if (descriptor) return descriptor;
  };
}

export const sortable = (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  if (!target._sortables) target._sortables = [];
  target._sortables.push(key);
  if (descriptor) return descriptor;
}

export const all = (target: any, key: string, descriptor?: PropertyDescriptor): void | any => {
  if (descriptor) descriptor.writable = true;
  searchable(target, key, descriptor);
  sortable(target, key, descriptor);
  if (!target._filterables) target._filterables = [];
  if (!target._filterablesOptions) target._filterablesOptions = {};
  target._filterables.push(key);
  target._filterablesOptions[key] = {type: 'auto'};
  if (descriptor) return descriptor;
}