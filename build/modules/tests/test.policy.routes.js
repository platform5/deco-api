"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("./../user/auth.middleware");
const policy_factory_1 = require("./../user/policy/policy.factory");
const app_middleware_1 = require("./../app/app.middleware");
const data_model_1 = require("./data.model");
const policy_controller_1 = require("./../user/policy/policy.controller");
const express_1 = require("express");
let debug = require('debug')('app:controller:test:policy');
const router = express_1.Router();
let mdController = new policy_controller_1.PolicyController(data_model_1.DataModel);
const asyncMiddleware = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error(error);
        next(error);
    });
};
router.get('/authenticated', app_middleware_1.AppMiddleware.fetchWithPublicKey, (req, res, next) => {
    next();
}, mdController.addPolicy(policy_factory_1.PolicyFactory.authenticate()), (req, res, next) => {
    next();
}, asyncMiddleware(mdController.checkRoutePolicy()), (req, res, next) => {
    next();
}, mdController.prepareQueryFromReq(), mdController.getAll());
router.get('/roles', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.addPolicy(policy_factory_1.PolicyFactory.userRole(['test'], 'include')), asyncMiddleware(mdController.checkRoutePolicy()), mdController.prepareQueryFromReq(), mdController.getAll());
router.get('/project-member/:projectId', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.addPolicy(policy_factory_1.PolicyFactory.projectMember('reader')), asyncMiddleware(mdController.checkRoutePolicy()), mdController.prepareQueryFromReq(), mdController.getAll());
router.get('/api-key', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.addPolicy(policy_factory_1.PolicyFactory.apiKey()), asyncMiddleware(mdController.checkRoutePolicy()), mdController.prepareQueryFromReq(), mdController.getAll());
router.post('/create', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticateWithoutError, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.post());
router.get('/all', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.prepareQueryFromReq(), mdController.getAll());
router.get('/owner', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.addPolicy(policy_factory_1.PolicyFactory.owner()), mdController.prepareQueryFromReq(), mdController.getAll());
router.get('/owner/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.addPolicy(policy_factory_1.PolicyFactory.owner()), mdController.getOne());
exports.TestPolicyController = router;
//# sourceMappingURL=test.policy.routes.js.map