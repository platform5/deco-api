import { Router } from 'express';
import { ControllerMiddleware, MultipartMiddleware } from '../../';
import { AppModel } from './app.model';
import { AppControllerMiddleware} from './app.middleware.controller';
import { AppMiddleware } from './app.middleware';
import { AuthMiddleware } from '../user/auth.middleware';
let debug = require('debug')('app:controller:app');

const router: Router = Router();

//let mdController = new ControllerMiddleware(AppModel);
let mdController = new AppControllerMiddleware(AppModel);
mdController.readByCreator = false;
mdController.writeByCreator = false;

mdController.readByUsersRoles = true;
mdController.writeByUsersRoles = true;
mdController.readUsersRoles = ['admin'];
mdController.writeUsersRoles = ['admin'];

router.get(
  ControllerMiddleware.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  ControllerMiddleware.getOneRoute(), 
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne()
);

router.get(
  ControllerMiddleware.getOneRoute() + '/stats', 
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserRoleAccess('adminUserRoles'),
  mdController.getOne()
);

router.get(
  ControllerMiddleware.getOneRoute() + '/key/:type/:index',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne({ignoreOutput: true, ignoreSend: true, ignoreDownload: true}),
  AppMiddleware.outputKey()
)

router.post(
  ControllerMiddleware.getOneRoute() + '/key/:type',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne({ignoreOutput: true, ignoreSend: true, ignoreDownload: true}),
  AppMiddleware.createKey(),
  mdController.sendLocals('element', true)
);

router.put(
  ControllerMiddleware.getOneRoute() + '/key/:type/:index/:last4',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne({ignoreOutput: true, ignoreSend: true, ignoreDownload: true}),
  AppMiddleware.editKey(),
  mdController.sendLocals('element', true)
);

router.delete(
  ControllerMiddleware.getOneRoute() + '/key/:type/:index/:last4',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne({ignoreOutput: true, ignoreSend: true, ignoreDownload: true}),
  AppMiddleware.deleteKey(),
  mdController.sendLocals('element', true)
);

router.post(
  '/:appId/user/:userId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp('admin'),
  AppMiddleware.addUser(),
  mdController.sendLocals('element', true)
);

router.put(
  '/:appId/user/:userId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  AppMiddleware.editUser(),
  mdController.sendLocals('element', false)
);

router.put(
  '/:appId/parent-user/:userId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp('admin'),
  AppMiddleware.editParentUser(),
  mdController.sendLocals('element', false)
);

router.delete(
  '/:appId/user/:userId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp('admin'),
  AppMiddleware.removeUser(),
  mdController.sendLocals('element', true)
);

router.post(
  ControllerMiddleware.postRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  // AppMiddleware.addAppIdToBody('appId'),
  MultipartMiddleware.parseDeco(<any>AppModel.deco),
  mdController.post()
);

router.put(
  ControllerMiddleware.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  // AppMiddleware.addAppIdToBody('appId'),
  MultipartMiddleware.parseDeco(<any>AppModel.deco),
  mdController.put()
);

router.delete(
  ControllerMiddleware.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.delete()
);

export const AppController: Router = router;