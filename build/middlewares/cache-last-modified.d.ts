/// <reference types="qs" />
import { Request, Response, NextFunction } from 'express';
export declare class CacheLastModified {
    static init(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static send(prop?: 'auto' | 'element' | 'elements' | string, source?: 'locals'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    private static registerCacheLastModified;
}
//# sourceMappingURL=cache-last-modified.d.ts.map