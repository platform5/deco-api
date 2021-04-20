import { TypeDecorator } from './type-decorator';
export interface Metadata {
    key: string;
    value: any;
    type?: string;
}
export declare let inputMetadata: (value: any, options: any) => any;
export declare let validateMetadata: (value: any, options: any) => boolean;
export declare let metadataDecorator: TypeDecorator;
export declare const metadata: (optionsOrTarget?: any, key?: string | undefined, descriptor?: PropertyDescriptor | undefined) => any;
//# sourceMappingURL=metadata.d.ts.map