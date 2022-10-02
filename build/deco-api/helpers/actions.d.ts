import { Response } from "express";
export declare class ActionsService {
    static setVariables(res: Response, variables: {
        [key: string]: any;
    }): void;
    /**
     *
     * Call a series of actions attached to a request
     * The actions will not infer the actual response sent to the requester
     * The will be performed if everything works well and abandonned if something
     * goes wrong.
     *
     * @param res Express Response to which these actions should be attached
     * @param actions Two-level deep actions array. The first level of actions will be run asynchronously (in parallel) and the second layer actions will be called synchronously (serie)
     */
    static runActions(res: Response, actions: typeof Action[][], variables?: {
        [key: string]: any;
    }): Promise<void>;
    private static runActionsInSerie;
}
export declare abstract class Action {
    static run(res: Response): void;
}
//# sourceMappingURL=actions.d.ts.map