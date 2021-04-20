/// <reference types="qs" />
import { RequestHandler, Request, Response, NextFunction } from 'express';
export declare class Log {
    static rotateLog: boolean;
    static logFolder: string;
    static logFormat: string;
    static extraErrorLog: boolean;
    static extraErrorLogFormat: string;
    static devLog: boolean;
    private static logInitOk;
    private static accessLogStream;
    private static accessErrorLogStream;
    private static errorsLogStream;
    static accessMiddleware(): RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
    static initLogFolderAndStreams(): void;
    static logRequests(): RequestHandler;
    static logAccessErrors(): RequestHandler;
    static logDevConsole(): RequestHandler;
    static errorsMiddleware(): (err: Error, req: Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => void;
}
//# sourceMappingURL=log.d.ts.map