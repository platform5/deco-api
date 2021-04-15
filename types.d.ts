/// <reference types="node" />

declare module 'rotating-file-stream' {
  var rfs: any;
  export = rfs;
}

declare module 'calipers' {
  var calipers: any;
  export = calipers;
}

declare module 'object-resolve-path' {
  var resolvePath: any;
  export = resolvePath;
}

declare module 'geojson-validation' {
  var gjv: any;
  export = gjv;
}
declare module 'traverse-async' {
  var traverse: (
    object: any, 
    callback: (this: {parent: any, node: any, key: string, path: Array<string>}, node: any, next: () => void | any) => any,
    onComplete?: (newObj: any) => any,
    onError?: (error: Error) => any) => {};
  var config: any;
  export {traverse, config};
}

declare module 'smsapicom' {
  var SMSAPI: any;
  export = SMSAPI;
}