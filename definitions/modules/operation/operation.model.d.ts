import { Model, ObjectId } from '../../';
import { Request, Response, NextFunction } from 'express';
declare type Status = 'pending' | 'in-progress' | 'completed' | 'errored';
export declare class Operation extends Model {
    appId: ObjectId | null;
    status: Status;
    message: string;
    startedAt: Date;
    duration: number;
    static create(appId: ObjectId, status: Status, startedAt?: Date): Promise<Operation>;
    static start(appId: ObjectId, operationId?: string | ObjectId): Promise<Operation>;
    static complete(operationId: string | ObjectId, message?: string): Promise<Operation>;
    static errored(operationId: string | ObjectId, message?: string): Promise<Operation>;
    static startMiddelware(req: Request, res: Response, next: NextFunction): void;
    static completeCurrentOperation(res: Response, status: 'completed' | 'errored', message?: string): Promise<Operation>;
    static sendCurrentOperation(req: Request, res: Response, next: NextFunction): void;
    static waitForCompletion(req: Request, res: Response, next: NextFunction): void;
}
export {};
//# sourceMappingURL=operation.model.d.ts.map