import { Model, ObjectId } from '../../';
export declare class ValidationTokenModel extends Model {
    appId: ObjectId | null;
    type: string;
    token: string;
    emailCode: string;
    mobileCode: string;
    emailValidated: boolean;
    mobileValidated: boolean;
    expires: Date;
    data: null;
    extraData: null;
    userCreated: boolean;
    logs: Array<any>;
    constructor();
    init(type: string, validity?: number, validityUnit?: 'hours' | 'minutes' | 'days' | 'weeks'): void;
}
//# sourceMappingURL=validation-token.model.d.ts.map