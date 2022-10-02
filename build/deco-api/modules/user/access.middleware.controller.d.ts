import { ControllerMiddleware } from './../../middlewares/controller';
import { Model, Query, ObjectId } from '../../';
import { Request, Response } from 'express';
export interface ModelByApp extends Model {
    appId?: ObjectId;
}
export interface ModelWithUsers extends Model {
    users?: Array<ObjectId>;
}
export interface UserRoles {
    _id: ObjectId;
    roles: Array<string>;
}
export interface ModelWithUsersRoles extends Model {
    users?: Array<UserRoles>;
}
export declare class AccessControllerMiddlware extends ControllerMiddleware {
    readByApp: boolean;
    writeByApp: boolean;
    readByCreator: boolean;
    writeByCreator: boolean;
    readByUsersArray: boolean;
    writeByUsersArray: boolean;
    readByUsersRoles: boolean;
    writeByUsersRoles: boolean;
    readUsersRoles: Array<string>;
    writeUsersRoles: Array<string>;
    enableRelatedToAppId: boolean;
    extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void>;
    getOneElement(element: Model, req: Request, res: Response): Promise<Model>;
    postElement(element: Model, req: Request, res: Response): Promise<Model>;
    putElement(element: Model, req: Request, res: Response): Promise<Model>;
    deleteElement(element: Model, req: Request, res: Response): Promise<Model>;
    checkAppId(element: Model, req: Request, res: Response): void;
    checkCreatoriId(element: Model, req: Request, res: Response): void;
    checkUsersArray(element: Model, req: Request, res: Response): boolean;
    checkUsersRoles(element: Model, req: Request, res: Response, roles: Array<string>): boolean;
}
//# sourceMappingURL=access.middleware.controller.d.ts.map