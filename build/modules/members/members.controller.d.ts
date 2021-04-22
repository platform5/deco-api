import { Request, Response, NextFunction } from "express";
export declare class MembersController {
    private static validateUserIdAndRoles;
    private static getInstance;
    static getMembersController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static addMemberController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static editMemberController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static removeMemberController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    private static validateRoles;
    static addRoleController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static editRoleController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static removeRoleController(localsProperty: string, send?: boolean): (req: Request, res: Response, next: NextFunction) => void;
    static fetchUserActions(localsProperty: string, addPolicyForActions?: Array<string>): (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=members.controller.d.ts.map