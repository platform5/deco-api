import { Model, ObjectId, UpdateQuery } from '../../';
export interface ApiKey {
    key: string;
    name: string;
    expires?: Date;
    active?: boolean;
}
export interface AppUserItem {
    _id: ObjectId;
    roles: Array<string>;
}
export declare class AppModel extends Model {
    appId: ObjectId | null;
    name: string;
    description: string;
    image: any;
    primaryColor: string;
    primaryForegroundColor: string;
    primaryLightColor: string;
    primaryLightForegroundColor: string;
    primaryDarkColor: string;
    primaryDarkForegroundColor: string;
    accentColor: string;
    accentForegroundColor: string;
    accentLightColor: string;
    accentLightForegroundColor: string;
    accentDarkColor: string;
    accentDarkForegroundColor: string;
    publicKeys: Array<ApiKey>;
    privateKeys: Array<ApiKey>;
    openUserRegistration: boolean;
    createAccountValidation: 'emailOrMobile' | 'emailAndMobile' | 'emailOnly' | 'mobileOnly' | 'none';
    createAccountRoles: Array<string>;
    requireDoubleAuth: boolean;
    doubleAuthMethod: string;
    enableShop: boolean;
    enableMultipleShops: boolean;
    availableRoles: Array<string>;
    adminUserRoles: Array<string>;
    adminShopRoles: Array<string>;
    enableThree: boolean;
    adminThreeRoles: Array<string>;
    users: Array<AppUserItem>;
    locales: Array<string>;
    defaultLocale: string;
    smtpConfigHost: string;
    smtpConfigPort: number;
    smtpConfigUser: string;
    smtpConfigPassword: string;
    smtpConfigSecure: boolean;
    smtpConfigFromName: string;
    smtpConfigFromEmail: string;
    pushEnabled: boolean;
    pushGmId: string;
    pushApnCert: string;
    pushApnKey: string;
    pushApnPass: string;
    pushApnProduction: boolean;
    pushTopic: string;
    output(): Promise<any>;
    toDocument(operation: 'insert' | 'update' | 'upsert'): Promise<UpdateQuery>;
    static generateKey(): string;
}
//# sourceMappingURL=app.model.d.ts.map