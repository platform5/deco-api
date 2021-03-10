/// <reference types="qs" />
import { Model, ObjectId, UpdateQuery, InstanceFromDocumentOptions } from '../../';
import { Request, Response, NextFunction } from "express";
export declare abstract class Members extends Model {
    appId: ObjectId;
    superAdminRole: string;
    roles: {
        [key: string]: Array<string>;
    };
    members: Array<{
        userId: ObjectId;
        roles: Array<string>;
    }>;
    actions(): Array<string>;
    toDocument(operation: 'insert' | 'update' | 'upsert', properties?: Array<string>): Promise<UpdateQuery>;
    static instanceFromDocument<T extends typeof Model>(document: any, options?: InstanceFromDocumentOptions): Promise<InstanceType<T>>;
    static fetchUserActionsWithElementId(this: typeof Model, addPolicyForActions?: Array<string>): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
}
//# sourceMappingURL=members.abstract.d.ts.map