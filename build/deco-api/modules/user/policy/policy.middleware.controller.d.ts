import { Policies } from '../../../';
import { ControllerMiddleware, Model, Query, ObjectId, ModelOperation } from '../../../';
import { Request, Response } from 'express';
export declare class PolicyControllerMiddlware extends ControllerMiddleware {
    getPolicy(req: Request, res: Response): Policies.Policy;
    getModelAccessPolicy(req: Request, res: Response, operation: ModelOperation): Policies.ModelAccessPolicy | null;
    getIOPolicies(req: Request, res: Response, operation: 'input' | 'output'): Array<Policies.IOPolicy>;
    extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void>;
    getOneElement(element: Model, req: Request, res: Response): Promise<Model>;
    postElement(element: Model, req: Request, res: Response): Promise<Model>;
    putElement(element: Model, req: Request, res: Response): Promise<Model>;
    deleteElement(element: Model, req: Request, res: Response): Promise<Model>;
    checkModelAccessPolicy(operation: ModelOperation, element: Model, req: Request, res: Response): Promise<Model>;
    checkPublicPolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response, element: Model | null): boolean | null;
    checkIncludeRolePolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response): void;
    checkExludeRolePolicy(modelAccessPolicy: Policies.ModelAccessPolicy, res: Response): void;
    fetchModelIds(res: Response, modelName: string, query: any): Promise<Array<ObjectId>>;
    compareElementPropertyWithIds(element: Model, property: string, ids: Array<ObjectId>): boolean;
    preInput<T>(element: T, req: Request, res: Response): Promise<T>;
    postOutput(element: any, req: Request, res: Response): Promise<any>;
    postOutputList(elements: any, req: Request, res: Response): Promise<any>;
    applyIOPolicies(res: Response, element: any, obj: any, ioPolicies: Array<Policies.IOPolicy>): void;
    filterObjectWithIOPolicy(obj: any, ioPolicy: Policies.IOPolicy): void;
}
//# sourceMappingURL=policy.middleware.controller.d.ts.map