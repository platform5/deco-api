import { Response } from "express";
let debug = require('debug')('app:actions:service');

export class ActionsService {

  public static setVariables(res: Response, variables: {[key: string]: any}) {
    if (!res.locals.actions) {
      res.locals.actions = {};
    }
    if (!res.locals.actions.variables) {
      res.locals.actions.variables = {};
    }
    for (const key in variables) {
      res.locals.actions.variables[key] = variables[key];
    }
  }

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
  public static async runActions(res: Response, actions: typeof Action[][], variables?: {[key: string]: any}): Promise<void> {
    if (variables) {
      ActionsService.setVariables(res, variables);
    }
    const results: Promise<void>[] = [];
    for (const parallelAction of actions) {
      results.push(ActionsService.runActionsInSerie(res, parallelAction));
    }
    for (const result of results) {
      try {
        await result;
      } catch (error) {
        // do nothing
      }
    }
  }

  private static async runActionsInSerie(res: Response, actions: typeof Action[]): Promise<void> {
    try {
      for (const action of actions) {
        await action.run(res);
      }
    } catch (error) {
      throw error;
    }
  }

}

export abstract class Action {
  public static run(res: Response): void {}
}