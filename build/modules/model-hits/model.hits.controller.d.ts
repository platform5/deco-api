/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
export declare class ModelHitsMiddleware {
    static singleHit(modelId: string | 'dynamic'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static singleStats(modelId: string | 'dynamic'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    private static modelId;
}
//# sourceMappingURL=model.hits.controller.d.ts.map