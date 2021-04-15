import { GetAllOptions } from './../decorators/model';
import { GetOneOptions } from './../decorators/model';
import { Deco } from '../interfaces/deco';
import { Query } from "../helpers/query";
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Model } from '../decorators/model';
let debug = require('debug')('deco-api:middleware:controller.hooks');

export class ControllerHooksMiddleware {

  /**
   * Hook allowing request modification before performing the control action
   * @param req 
   * @param control 
   */
  extendRequest(req: Request, control: 'getAll' | 'getOne' | 'post' | 'put' | 'delete'): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Hook allowing to modify the query used in getAll control action
   * @param query 
   * @param req 
   * @param res 
   */
  extendGetAllQuery(query: Query, req: Request, res: Response, options?: GetAllOptions): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Hook allowing to modify the query used in getOne, put(), delete() control action
   * @param query 
   * @param req 
   * @param res 
   */
  extendGetOneQuery(query: Query, req: Request, res: Response, options?: GetOneOptions): Promise<void> {
    return Promise.resolve();
  }

  preInput<T>(element: T, req: Request, response: Response): Promise<T> {
    return Promise.resolve(element);
  }

  getOneElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId> {
    return Promise.resolve(elementId);
  }

  getOneElement(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  postElement(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  postManyQuantity(element: Model, req: Request, res: Response, quantity?: number): Promise<number> {
    return Promise.resolve(1);
  }

  postAfterInsert(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  putElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId> {
    return Promise.resolve(elementId);
  }

  putElement(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  putAfterUpdate(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  deleteElementId(elementId: string | ObjectId, req: Request, res: Response): Promise<string | ObjectId> {
    return Promise.resolve(elementId);
  }

  deleteElement(element: Model, req: Request, res: Response): Promise<Model> {
    return Promise.resolve(element);
  }

  deleteAfterDelete(result: any, req: Request, res: Response): Promise<any> {
    return Promise.resolve(result);
  }

  queryBefore(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query> {
    return Promise.resolve(query);
  }

  queryAfter(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query> {
    return Promise.resolve(query);
  }

  postOutput(element: any, req: Request, res: Response): Promise<any> {
    return Promise.resolve(element);
  }

  postOutputList(elements: any, req: Request, res: Response): Promise<any> {
    return Promise.resolve(elements);
  }

}