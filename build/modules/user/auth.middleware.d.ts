/// <reference types="qs" />
import { AppModel } from './../app/app.model';
import { UserModel } from './user.model';
import { AccessTokenModel } from './access-token.model';
import { Request, Response, NextFunction } from 'express';
import { ObjectId } from '../../';
export declare class AuthMiddleware {
    static getToken(req: Request, res: Response, next: NextFunction): void | Error;
    static notifyUserWithDoubleAuthCode(app: AppModel, username: string, user: UserModel, token: AccessTokenModel, req: Request): any;
    static revokeToken(req: Request, res: Response, next: NextFunction): void;
    static tryAuthentication(appId: ObjectId, token: string): Promise<UserModel>;
    static tryToAuthenticate(req: Request, res: Response): Promise<void>;
    static authenticate(req: Request, res: Response, next: NextFunction): void;
    static authenticateWithoutError(req: Request, res: Response, next: NextFunction): void;
    static addAppIdInQuery(req: Request, res: Response, next: NextFunction): void;
    static addAppIdFromParamsToQuery(req: Request, res: Response, next: NextFunction): void;
    static checkUserRoleAccess(prop: 'adminUserRoles' | 'adminShopRoles' | 'adminThreeRoles'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static checkRoleViaParamApp(roles: string | Array<string>): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static allowOnlyRoles(roles?: Array<string>): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static forgotPassword(req: Request, res: Response, next: NextFunction): void;
    static resetPassword(req: Request, res: Response, next: NextFunction): void;
    static passwordChange(req: Request, res: Response, next: NextFunction): void;
    static requestEmailOrMobileChange(type: 'email' | 'mobile'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
    static validateEmailOrMobileChange(type: 'email' | 'mobile'): (req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
}
//# sourceMappingURL=auth.middleware.d.ts.map