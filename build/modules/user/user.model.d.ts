import { Model, ObjectId, UpdateQuery } from '../../';
export declare class UserModel extends Model {
    appId: ObjectId | null;
    firstname: string;
    lastname: string;
    email: string;
    emailValidated: boolean;
    mobile: string;
    mobileValidated: boolean;
    hash: string;
    hashUpdateDate: Date;
    requireDoubleAuth: boolean;
    locale: string;
    roles: Array<string>;
    hideOnboarding: boolean;
    LDAPLogin: boolean;
    LDAPUrl: string;
    LDAPDC: string;
    static hashFromPassword(password: string): string;
    generateHash(password: string): void;
    toDocument(operation: 'insert' | 'update' | 'upsert', properties?: Array<string>): Promise<UpdateQuery>;
    static authUser(appId: ObjectId, username: string, password: string): Promise<UserModel | false>;
}
//# sourceMappingURL=user.model.d.ts.map