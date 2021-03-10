import { Request, Response, NextFunction } from 'express';
export declare class CacheLastModified {
    static init(): (req: Request, res: Response, next: NextFunction) => void;
    static send(prop?: 'auto' | 'element' | 'elements' | string, source?: 'locals'): (req: Request, res: Response, next: NextFunction) => void;
    private static registerCacheLastModified;
}
//# sourceMappingURL=cache-last-modified.d.ts.map