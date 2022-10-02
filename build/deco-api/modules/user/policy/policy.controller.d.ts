/// <reference types="qs" />
import { ControllerMiddleware } from './../../../middlewares/controller';
import { NextFunction } from 'express';
import { Query, GetAllOptions, GetOneOptions } from '../../../';
import { Request, Response } from 'express';
import { Policy } from './policy.model';
export declare class PolicyController extends ControllerMiddleware {
    private computePointer;
    private traversePointerQuery;
    registerPolicyMountingPoint(key: string | string[]): (_req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static registerPolicyMountingPoint(key: string | string[]): (_req: Request, res: Response, next: NextFunction) => void;
    private mountPolicies;
    addPolicy(newPolicy: Policy | Policy[]): (_req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static addPolicy(newPolicy: Policy | Policy[]): (_req: Request, res: Response, next: NextFunction) => void;
    checkRoutePolicy(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
    extendGetAllQuery(query: Query, req: Request, res: Response, options: GetAllOptions): Promise<void>;
    extendGetOneQuery(query: Query, req: Request, res: Response, options: GetOneOptions): Promise<void>;
    checkAccessPolicy(query: Query, req: Request, res: Response, options: GetAllOptions | GetOneOptions): Promise<void>;
}
//# sourceMappingURL=policy.controller.d.ts.map