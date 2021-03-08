"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_middleware_1 = require("./../app/app.middleware");
const auth_middleware_1 = require("./../user/auth.middleware");
const controller_1 = require("./../../middlewares/controller");
const template_model_1 = require("./template.model");
const express_1 = require("express");
let debug = require('debug')('app:controller:template');
const router = express_1.Router();
let mdController = new controller_1.ControllerMiddleware(template_model_1.TemplateModel);
router.get('/:appId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'template']), mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdFromParamsToQuery, mdController.getAll());
router.get('/:appId/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'template']), mdController.getOne());
router.post('/:appId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'template']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), mdController.post());
router.put('/:appId/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'template']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), mdController.put());
router.delete('/:appId/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'template']), mdController.delete());
exports.TemplateController = router;
//# sourceMappingURL=template.controller.js.map