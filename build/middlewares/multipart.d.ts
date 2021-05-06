import { Deco } from './../interfaces';
import multer from 'multer';
import { RequestHandler, Request, Response, NextFunction } from 'express';
export interface MultipartRequest extends Request {
    filesPropertyOptions?: {
        [key: string]: any;
    };
}
export declare class MultipartMiddleware {
    static uploadEngine: multer.Multer;
    static parseDeco(deco: Deco, storage?: 'fs' | 'gfs'): Array<RequestHandler>;
    static filesOptionsInRequest(deco: Deco, fileProperties: Array<string>): (req: MultipartRequest, res: Response, next: NextFunction) => void;
    static filesInBody(req: Request, res: Response, next: NextFunction): void;
}
//# sourceMappingURL=multipart.d.ts.map