import { Model, ObjectId } from '../../';
export declare class AccessTokenModel extends Model {
    appId: ObjectId | null;
    type: string;
    token: string;
    refresh?: string;
    code: string;
    expires: Date;
    userId: ObjectId | null;
    constructor();
    init(type: 'access' | 'double-auth', userId: ObjectId, appId: ObjectId, validity?: number, validityUnit?: 'hours' | 'minutes' | 'days' | 'weeks'): void;
    output(): Promise<any>;
}
//# sourceMappingURL=access-token.model.d.ts.map