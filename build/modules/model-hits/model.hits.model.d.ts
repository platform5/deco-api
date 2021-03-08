import { Model, ObjectId } from '../../';
import { Request, Response } from 'express';
export declare class Hit {
    method: 'get' | 'post' | 'put' | 'delete';
    date: Date;
}
export declare class ModelHitsModel extends Model {
    appId: ObjectId | null;
    userId: ObjectId | null;
    modelId: string;
    elementId: ObjectId;
    singleHit: boolean;
    ip: string;
    hits: Array<Hit>;
    static singleHit(req: Request, res: Response, modelId: string, elementId?: string): Promise<import("mongodb").WriteOpResult>;
    static singleStats(req: Request, res: Response, modelId: string, elementId?: string): Promise<number>;
    static elementIdFromRequest(req: Request, res: Response, elementId?: string): ObjectId;
}
//# sourceMappingURL=model.hits.model.d.ts.map