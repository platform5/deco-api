import { TypeDecorator } from '../index';
export declare let inputAddress: (value: any) => any;
export declare let validateAddress: (value: any, options?: any) => boolean;
export declare let addressDecorator: TypeDecorator;
export declare const address: (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
export declare let inputAddressArray: (value: any) => any;
export declare let validateAddressArray: (value: any, options?: any) => boolean;
export declare let addressArrayDecorator: TypeDecorator;
export declare const addressArray: (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
export interface Address {
    label?: string;
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
    description?: string;
    accessInformation?: string;
    lat?: number;
    lng?: number;
}
//# sourceMappingURL=address.d.ts.map