"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const express_1 = require("express");
const __1 = require("../../");
const app_model_1 = require("./app.model");
const app_middleware_controller_1 = require("./app.middleware.controller");
const app_middleware_1 = require("./app.middleware");
const auth_middleware_1 = require("../user/auth.middleware");
let debug = require('debug')('app:controller:app');
const router = express_1.Router();
//let mdController = new ControllerMiddleware(AppModel);
let mdController = new app_middleware_controller_1.AppControllerMiddleware(app_model_1.AppModel);
mdController.readByCreator = false;
mdController.writeByCreator = false;
mdController.readByUsersRoles = true;
mdController.writeByUsersRoles = true;
mdController.readUsersRoles = ['admin'];
mdController.writeUsersRoles = ['admin'];
router.get(__1.ControllerMiddleware.getAllRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.prepareQueryFromReq(), mdController.getAll());
router.get(__1.ControllerMiddleware.getOneRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne());
router.get(__1.ControllerMiddleware.getOneRoute() + '/stats', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkUserRoleAccess('adminUserRoles'), mdController.getOne());
router.get(__1.ControllerMiddleware.getOneRoute() + '/key/:type/:index', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne({ ignoreOutput: true, ignoreSend: true, ignoreDownload: true }), app_middleware_1.AppMiddleware.outputKey());
router.post(__1.ControllerMiddleware.getOneRoute() + '/key/:type', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne({ ignoreOutput: true, ignoreSend: true, ignoreDownload: true }), app_middleware_1.AppMiddleware.createKey(), mdController.sendLocals('element', true));
router.put(__1.ControllerMiddleware.getOneRoute() + '/key/:type/:index/:last4', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne({ ignoreOutput: true, ignoreSend: true, ignoreDownload: true }), app_middleware_1.AppMiddleware.editKey(), mdController.sendLocals('element', true));
router.delete(__1.ControllerMiddleware.getOneRoute() + '/key/:type/:index/:last4', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne({ ignoreOutput: true, ignoreSend: true, ignoreDownload: true }), app_middleware_1.AppMiddleware.deleteKey(), mdController.sendLocals('element', true));
router.post('/:appId/user/:userId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp('admin'), app_middleware_1.AppMiddleware.addUser(), mdController.sendLocals('element', true));
router.put('/:appId/user/:userId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), app_middleware_1.AppMiddleware.editUser(), mdController.sendLocals('element', false));
router.put('/:appId/parent-user/:userId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp('admin'), app_middleware_1.AppMiddleware.editParentUser(), mdController.sendLocals('element', false));
router.delete('/:appId/user/:userId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp('admin'), app_middleware_1.AppMiddleware.removeUser(), mdController.sendLocals('element', true));
router.post(__1.ControllerMiddleware.postRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, 
// AppMiddleware.addAppIdToBody('appId'),
__1.MultipartMiddleware.parseDeco(app_model_1.AppModel.deco), mdController.post());
router.put(__1.ControllerMiddleware.putRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, 
// AppMiddleware.addAppIdToBody('appId'),
__1.MultipartMiddleware.parseDeco(app_model_1.AppModel.deco), mdController.put());
router.delete(__1.ControllerMiddleware.deleteRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.delete());
exports.AppController = router;
//# sourceMappingURL=app.controller.js.map