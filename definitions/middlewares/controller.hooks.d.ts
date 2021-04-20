import { GetAllOptions } from './../decorators/model';
import { GetOneOptions } from './../decorators/model';
import { Deco } from '../interfaces/deco';
import { Query } from "../helpers/query";
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Model } from '../decorators/model';
export declare class ControllerHooksMiddleware {
    /**
     * Hook allowing request modification before performing the control action
     * @param req
     * @param control
     */
    extendRequest(req: Request, control: 'getAll' | 'getOne' | 'post' | 'put' | 'delete'): Promise<void>;
    /**
     * Hook allowing to modify the query used in getAll control action
     * @param query
     * @param req
     * @param res
     */
    extendGetAllQuery(query: Query, req: Request, res: Response, options?: GetAllOptions): Promise<void>;
    /**
     * Hook allowing to modify the query used in getOne, put(), delete() control action
     * @param query
     * @param req
     * @param res
     */
    extendGetOneQuery(query: Query, req: Request, res: Response, options?: GetOneOptions): Promise<void>;
    preInput<T>(element: T, req: Request, response: Response): Promise<T>;
    getOneElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId>;
    getOneElement(element: Model, req: Request, res: Response): Promise<Model>;
    postElement(element: Model, req: Request, res: Response): Promise<Model>;
    postManyQuantity(element: Model, req: Request, res: Response, quantity?: number): Promise<number>;
    postAfterInsert(element: Model, req: Request, res: Response): Promise<Model>;
    putElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId>;
    putElement(element: Model, req: Request, res: Response): Promise<Model>;
    putAfterUpdate(element: Model, req: Request, res: Response): Promise<Model>;
    deleteElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId>;
    deleteElement(element: Model, req: Request, res: Response): Promise<Model>;
    deleteAfterDelete(result: any, req: Request, res: Response): Promise<any>;
    queryBefore(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query>;
    queryAfter(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query>;
    postOutput(element: any, req: Request, res: Response): Promise<any>;
    postOutputList(elements: any, req: Request, res: Response): Promise<any>;
}
//# sourceMappingURL=controller.hooks.d.ts.map