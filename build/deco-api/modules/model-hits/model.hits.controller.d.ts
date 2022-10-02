import { Request, Response, NextFunction } from 'express';
export declare class ModelHitsMiddleware {
    static singleHit(modelId: string | 'dynamic'): (req: Request, res: Response, next: NextFunction) => void;
    static singleStats(modelId: string | 'dynamic'): (req: Request, res: Response, next: NextFunction) => void;
    private static modelId;
}
//# sourceMappingURL=model.hits.controller.d.ts.map