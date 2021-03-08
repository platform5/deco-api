import { MultipartMiddleware } from './../../middlewares/multipart';
import { AuthMiddleware } from './../user/auth.middleware';
import { AppMiddleware } from './../app/app.middleware';
import { PushPlayerModel } from './push.player.model';
import { PushNotificationModel } from './push.notification.model';
import { PushControllerMiddleware } from './push.middleware.controller';
import { Router } from 'express';

let debug = require('debug')('app:controller:push');

const router: Router = Router();

let notificationController = new PushControllerMiddleware(PushNotificationModel);
let playerController = new PushControllerMiddleware(PushPlayerModel);

router.post('/player',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  AuthMiddleware.authenticateWithoutError,
  playerController.registerPlayer()
);

router.put('/player/visit',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  AuthMiddleware.authenticateWithoutError,
  playerController.setVisitInBody,
  playerController.put()
);

router.get('/player/:regId/tags',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  AuthMiddleware.authenticateWithoutError,
  playerController.allowOnlyInBody(['tags']),
  playerController.getOne({ignoreSend: true, ignoreOutput: false, ignoreDownload: true}),
  playerController.sendTags
);

router.put('/player/:regId',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  AuthMiddleware.authenticateWithoutError,
  playerController.allowOnlyInBody(['tags']),
  playerController.put({ignoreSend: true, ignoreOutput: false}),
  playerController.sendTags
);

router.get('/:appId/player/nb',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.allowOnlyRoles(['admin', 'push']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  playerController.getNbPlayers,
  playerController.sendLocals('nbPlayers')
);

router.get('/:appId/player/tags',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.allowOnlyRoles(['admin', 'push']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  playerController.getPlayerTags,
  playerController.sendLocals('tags')
);




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

router.get(
  '/:appId/notification',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(false),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'push']),
  notificationController.prepareQueryFromReq(),
  notificationController.getAll()
);

router.post(
  '/:appId/notification',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(false),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'push']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  MultipartMiddleware.parseDeco(<any>PushNotificationModel.deco),
  notificationController.post()
);

router.put(
  '/:appId/notification/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(false),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'push']),
  MultipartMiddleware.parseDeco(<any>PushNotificationModel.deco),
  notificationController.put()
);

router.delete(
  '/:appId/notification/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(false),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'push']),
  notificationController.delete()
);

export const PushController: Router = router;