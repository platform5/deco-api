import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
import { Query } from '../../';
export declare class PushControllerMiddleware extends ControllerMiddleware {
    extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void>;
    registerPlayer(): (req: Request, res: Response, next: NextFunction) => void;
    extendRequest(req: Request, control: 'getAll' | 'getOne' | 'post' | 'put' | 'delete'): Promise<void>;
    sendTags(req: Request, res: Response, next: NextFunction): void;
    setVisitInBody(req: Request, res: Response, next: NextFunction): void;
    getNbPlayers(req: Request, res: Response, next: NextFunction): void;
    getPlayerTags(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=push.middleware.controller.d.ts.map