"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
let debug = require('debug')('app:actions:service');
class ActionsService {
    static setVariables(res, variables) {
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
    static runActions(res, actions, variables) {
        return __awaiter(this, void 0, void 0, function* () {
            if (variables) {
                ActionsService.setVariables(res, variables);
            }
            const results = [];
            for (const parallelAction of actions) {
                results.push(ActionsService.runActionsInSerie(res, parallelAction));
            }
            for (const result of results) {
                try {
                    yield result;
                }
                catch (error) {
                    // do nothing
                }
            }
        });
    }
    static runActionsInSerie(res, actions) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                for (const action of actions) {
                    yield action.run(res);
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.ActionsService = ActionsService;
class Action {
    static run(res) { }
}
exports.Action = Action;
//# sourceMappingURL=actions.js.map