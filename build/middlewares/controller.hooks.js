"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerHooksMiddleware = void 0;
let debug = require('debug')('deco-api:middleware:controller.hooks');
class ControllerHooksMiddleware {
    /**
     * Hook allowing request modification before performing the control action
     * @param req
     * @param control
     */
    extendRequest(req, control) {
        return Promise.resolve();
    }
    /**
     * Hook allowing to modify the query used in getAll control action
     * @param query
     * @param req
     * @param res
     */
    extendGetAllQuery(query, req, res, options) {
        return Promise.resolve();
    }
    /**
     * Hook allowing to modify the query used in getOne, put(), delete() control action
     * @param query
     * @param req
     * @param res
     */
    extendGetOneQuery(query, req, res, options) {
        return Promise.resolve();
    }
    preInput(element, req, response) {
        return Promise.resolve(element);
    }
    getOneElementId(elementId, req, res) {
        return Promise.resolve(elementId);
    }
    getOneElement(element, req, res) {
        return Promise.resolve(element);
    }
    postElement(element, req, res) {
        return Promise.resolve(element);
    }
    postManyQuantity(element, req, res, quantity) {
        return Promise.resolve(1);
    }
    postAfterInsert(element, req, res) {
        return Promise.resolve(element);
    }
    putElementId(elementId, req, res) {
        return Promise.resolve(elementId);
    }
    putElement(element, req, res) {
        return Promise.resolve(element);
    }
    putAfterUpdate(element, req, res) {
        return Promise.resolve(element);
    }
    deleteElementId(elementId, req, res) {
        return Promise.resolve(elementId);
    }
    deleteElement(element, req, res) {
        return Promise.resolve(element);
    }
    deleteAfterDelete(result, req, res) {
        return Promise.resolve(result);
    }
    queryBefore(req, res, query, deco) {
        return Promise.resolve(query);
    }
    queryAfter(req, res, query, deco) {
        return Promise.resolve(query);
    }
    postOutput(element, req, res) {
        return Promise.resolve(element);
    }
    postOutputList(elements, req, res) {
        return Promise.resolve(elements);
    }
}
exports.ControllerHooksMiddleware = ControllerHooksMiddleware;
//# sourceMappingURL=controller.hooks.js.map