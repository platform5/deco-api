/// <reference types="qs" />
import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
import { Model } from '../../';
export declare class UserControllerMiddleware extends ControllerMiddleware {
    private ignoreEmailsForTestAccounts;
    validateAndPost(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    resendCode(req: Request, res: Response, next: NextFunction): void;
    private createUserAndToken;
    private validateTokenAndInsert;
    getCurrentUser(): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    getOneElement(element: Model, req: Request, res: Response): Promise<Model>;
    putElement(element: Model, req: Request, res: Response): Promise<Model>;
    deleteElement(element: Model, req: Request, res: Response): Promise<Model>;
    outputSearch(req: Request, res: Response, next: NextFunction): void;
    onlyUsersInvitedInParamApp(req: Request, res: Response, next: NextFunction): void;
    outputParamAppRoles(req: Request, res: Response, next: NextFunction): void;
    hideOnboarding(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=user.middleware.controller.d.ts.map