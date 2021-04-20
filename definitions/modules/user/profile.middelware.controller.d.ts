/// <reference types="qs" />
import { AuthMiddleware } from './auth.middleware';
import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
export declare class ProfileControllerMiddleware extends ControllerMiddleware {
    getCurrentProfile(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    authenticateExceptForPictureDownload(req: Request, res: Response, next: NextFunction): void | typeof AuthMiddleware.authenticate;
}
//# sourceMappingURL=profile.middelware.controller.d.ts.map