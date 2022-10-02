export declare function addTargetInfo(target: any, typeName: string, key: string | number | symbol, options?: {}): void;
export declare const searchable: (target: any, key: string, descriptor?: PropertyDescriptor | undefined) => void | any;
export declare const filterable: (options?: any) => (target: any, key: string, descriptor?: PropertyDescriptor | undefined) => void | any;
export declare const sortable: (target: any, key: string, descriptor?: PropertyDescriptor | undefined) => void | any;
export declare const all: (target: any, key: string, descriptor?: PropertyDescriptor | undefined) => void | any;
//# sourceMappingURL=query.d.ts.map