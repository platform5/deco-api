"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushController = void 0;
const multipart_1 = require("./../../middlewares/multipart");
const auth_middleware_1 = require("./../user/auth.middleware");
const app_middleware_1 = require("./../app/app.middleware");
const push_player_model_1 = require("./push.player.model");
const push_notification_model_1 = require("./push.notification.model");
const push_middleware_controller_1 = require("./push.middleware.controller");
const express_1 = require("express");
let debug = require('debug')('app:controller:push');
const router = express_1.Router();
let notificationController = new push_middleware_controller_1.PushControllerMiddleware(push_notification_model_1.PushNotificationModel);
let playerController = new push_middleware_controller_1.PushControllerMiddleware(push_player_model_1.PushPlayerModel);
router.post('/player', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
auth_middleware_1.AuthMiddleware.authenticateWithoutError, playerController.registerPlayer());
router.put('/player/visit', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
auth_middleware_1.AuthMiddleware.authenticateWithoutError, playerController.setVisitInBody, playerController.put());
router.get('/player/:regId/tags', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
auth_middleware_1.AuthMiddleware.authenticateWithoutError, playerController.allowOnlyInBody(['tags']), playerController.getOne({ ignoreSend: true, ignoreOutput: false, ignoreDownload: true }), playerController.sendTags);
router.put('/player/:regId', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
auth_middleware_1.AuthMiddleware.authenticateWithoutError, playerController.allowOnlyInBody(['tags']), playerController.put({ ignoreSend: true, ignoreOutput: false }), playerController.sendTags);
router.get('/:appId/player/nb', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.allowOnlyRoles(['admin', 'push']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), playerController.getNbPlayers, playerController.sendLocals('nbPlayers'));
router.get('/:appId/player/tags', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.allowOnlyRoles(['admin', 'push']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), playerController.getPlayerTags, playerController.sendLocals('tags'));
// router.get(
//   ControllerMiddleware.getAllRoute(),
//   AppMiddleware.fetchWithPublicKey,
//   mdController.prepareQueryFromReq(),
//   mdController.getAll()
// );
// router.get(
//   ControllerMiddleware.getOneRoute(),
//   AppMiddleware.fetchWithPublicKey,
//   mdController.getOne()
// );
router.get('/:appId/notification', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(false), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'push']), notificationController.prepareQueryFromReq(), notificationController.getAll());
router.post('/:appId/notification', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(false), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'push']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), multipart_1.MultipartMiddleware.parseDeco(push_notification_model_1.PushNotificationModel.deco), notificationController.post());
router.put('/:appId/notification/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(false), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'push']), multipart_1.MultipartMiddleware.parseDeco(push_notification_model_1.PushNotificationModel.deco), notificationController.put());
router.delete('/:appId/notification/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(false), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'push']), notificationController.delete());
exports.PushController = router;
//# sourceMappingURL=push.controller.js.map