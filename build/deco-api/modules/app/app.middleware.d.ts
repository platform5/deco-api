import { Request, Response, NextFunction } from 'express';
export declare class AppMiddleware {
    static fetchWithPrivateKey(req: Request, res: Response, next: NextFunction): void;
    static fetchWithPublicKey(req: Request, res: Response, next: NextFunction): void;
    static fetchParamApp(requireUserAccessToParamApp?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static addAppIdToBody(prop?: string): (req: Request, res: Response, next: NextFunction) => void;
    static addAppIdFromParamsToBody(prop?: string): (req: Request, res: Response, next: NextFunction) => void;
    static outputKey(): (req: Request, res: Response, next: NextFunction) => void;
    static createKey(): (req: Request, res: Response, next: NextFunction) => void;
    static editKey(): (req: Request, res: Response, next: NextFunction) => void;
    static deleteKey(): (req: Request, res: Response, next: NextFunction) => void;
    static addUser(): (req: Request, res: Response, next: NextFunction) => void;
    static editUser(): (req: Request, res: Response, next: NextFunction) => void;
    static editParentUser(): (req: Request, res: Response, next: NextFunction) => void;
    static removeUser(): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=app.middleware.d.ts.map