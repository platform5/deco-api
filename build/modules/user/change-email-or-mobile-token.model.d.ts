import { Model, ObjectId } from '../../';
export declare class ChangeEmailOrMobileTokenModel extends Model {
    appId: ObjectId | null;
    token: string;
    code: string;
    expires: Date;
    userId: ObjectId | null;
    type: 'email' | 'mobile';
    newEmail: string;
    newMobile: string;
    used: boolean;
    constructor();
    init(userId: ObjectId, appId: ObjectId, validity?: number, validityUnit?: 'hours' | 'minutes' | 'days' | 'weeks'): void;
    set(type: 'email' | 'mobile', value: string): void;
}
//# sourceMappingURL=change-email-or-mobile-token.model.d.ts.map