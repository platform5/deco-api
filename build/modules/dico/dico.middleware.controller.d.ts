/// <reference types="qs" />
import { AccessControllerMiddlware } from './../user/access.middleware.controller';
import { Request, Response, NextFunction } from 'express';
import { ObjectId } from '../../';
export declare class DicoControllerMiddleware extends AccessControllerMiddlware {
    static validateKey(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void | Promise<void>;
    static logInvalidKey(appId: ObjectId, key: string, reason: string): void;
    post(options?: {
        ignoreOutput: boolean;
        ignoreSend: boolean;
    }): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<void> | undefined;
    combineForBackend(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void | Response<any, Record<string, any>>;
    combineForContexts(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    checkAndFixDico(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
}
//# sourceMappingURL=dico.middleware.controller.d.ts.map