import { AppMiddleware } from './../app/app.middleware';
import { AuthMiddleware } from './../user/auth.middleware';
import { ControllerMiddleware } from './../../middlewares/controller';
import { TemplateModel } from './template.model';
import { Router } from 'express';
let debug = require('debug')('app:controller:template');

const router: Router = Router();

let mdController = new ControllerMiddleware(TemplateModel);

router.get(
  '/:appId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'template']),
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdFromParamsToQuery,
  mdController.getAll()
);

router.get(
  '/:appId/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'template']),
  mdController.getOne()
);

router.post(
  '/:appId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'template']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  mdController.post()
);

router.put(
  '/:appId/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'template']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  mdController.put()
);

router.delete(
  '/:appId/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'template']),
  mdController.delete()
);

export const TemplateController: Router = router;