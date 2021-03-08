import { Model, AppModel } from '../../';
import { AccessControllerMiddlware } from '../user/access.middleware.controller';
import { Request, Response } from 'express';
export declare class AppControllerMiddleware extends AccessControllerMiddlware {
    postElement(element: AppModel, req: Request, res: Response): Promise<Model>;
}
//# sourceMappingURL=app.middleware.controller.d.ts.map