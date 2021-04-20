import { Request, Response } from 'express';
import { Model, ObjectId, Deco } from '../../';
export declare class DynamicDataModel2 extends Model {
    _id: ObjectId;
    _createdAt: Date;
    _updatedAt: Date;
    _createdBy: ObjectId;
    _updatedBy: ObjectId;
    appId: ObjectId | null;
    modelId: ObjectId | null;
    static decoFromRequest(req: Request, res: Response): Deco;
    decoFromRequest(req: Request, res: Response): Deco;
}
//# sourceMappingURL=dynamicdata2.model.d.ts.map