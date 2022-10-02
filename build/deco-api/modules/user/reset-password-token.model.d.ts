import { Model, ObjectId } from '../../';
export declare class ResetPasswordTokenModel extends Model {
    appId: ObjectId | null;
    token: string;
    code: string;
    expires: Date;
    userId: ObjectId | null;
    constructor();
    init(userId: ObjectId, appId: ObjectId, validity?: number, validityUnit?: 'hours' | 'minutes' | 'days' | 'weeks'): void;
}
//# sourceMappingURL=reset-password-token.model.d.ts.map