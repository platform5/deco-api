import { AuthMiddleware } from './auth.middleware';
import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
export declare class ProfileControllerMiddleware extends ControllerMiddleware {
    getCurrentProfile(): (req: Request, res: Response, next: NextFunction) => void;
    authenticateExceptForPictureDownload(req: Request, res: Response, next: NextFunction): void | typeof AuthMiddleware.authenticate;
}
//# sourceMappingURL=profile.middelware.controller.d.ts.map