import { PolicyControllerMiddlware } from './../user/policy/policy.middleware.controller';
import { AppModel } from './../app/app.model';
import { DynamicConfigModel } from './dynamicconfig.model';
import { Request, Response, NextFunction } from 'express';
import { RelatedModelFilterQueryConfig, Policies } from '../../';
import { Deco, TypeDecorator, ObjectId, Query, Model, StringStringMap } from '../../';
import { TemplateOverride } from '../../';
export declare let dynamicModelDecorator: TypeDecorator;
export declare let dynamicModelsDecorator: TypeDecorator;
export declare class Dynamic2MiddlwareController extends PolicyControllerMiddlware {
    static getAllRoute(): string;
    static getOneRoute(): string;
    static postRoute(): string;
    static putRoute(): string;
    static deleteRoute(): string;
    static placeDynamicConfigInRequestWithSlug(slug: string): (req: Request, res: Response, next: NextFunction) => void;
    static placeDynamicConfigInRequest(req: Request, res: Response, next: NextFunction): void;
    static getDecoFromConfigModel(configModel: DynamicConfigModel, parentApp: AppModel | ObjectId, appModel: AppModel): Deco;
    static getDecoFromSlug(appId: ObjectId, slug: string): Promise<Deco>;
    static authenticateAndErrorOnlyIfNotPublic(req: Request, res: Response, next: NextFunction): void;
    getModelDeco(req: Request, res: Response): any;
    getPolicy(req: Request, res: Response): Policies.Policy;
    extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void>;
    static multipartWrapper(req: Request, res: Response, next: NextFunction): any;
    postAfterInsert(element: Model, req: Request, res: Response): Promise<Model>;
    putAfterUpdate(element: Model, req: Request, res: Response): Promise<Model>;
    deleteAfterDelete(result: any, req: Request, res: Response): Promise<any>;
    findOriginalModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>>;
    findDetectedModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>>;
    prepareModelNotification(res: Response, element: Model): Promise<Model>;
    sendNotification(app: AppModel, email: string, subject: string, element: Model, keyValues: StringStringMap, contentPrefix: string, contentSuffix: string, template: string | undefined, templateOverride: TemplateOverride | null): Promise<boolean>;
}
//# sourceMappingURL=dynamic2.middleware.controller.d.ts.map