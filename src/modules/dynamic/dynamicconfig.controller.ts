import { ControllerMiddleware } from './../../middlewares/controller';
import { DynamicConfigModel } from './dynamicconfig.model';
import { AccessControllerMiddlware } from './../user/access.middleware.controller';
import { Router, Request, Response, NextFunction } from 'express';
import { AppMiddleware } from '..';
let debug = require('debug')('app:controller:data');

const router: Router = Router();

let parsePolicyProperty = (req: Request, res: Response, next: NextFunction) => {
  if (req.body && req.body.policy && typeof req.body.policy === 'string') {
    try {
      req.body.policy = JSON.parse(req.body.policy);
    } catch (error) {
      return next(new Error('Invalid JSON value in policy property'));
    }
  }
  return next();
}

let mdController = new AccessControllerMiddlware(DynamicConfigModel);
mdController.enableRelatedToAppId = true;

router.get(
  ControllerMiddleware.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  mdController.prepareQueryFromReq(),
  mdController.getAll(null, {enableLastModifiedCaching: true})
);

router.get(
  ControllerMiddleware.getOneRoute(),
  AppMiddleware.fetchWithPublicKey,
  mdController.getOne()
);

router.post(
  ControllerMiddleware.postRoute(),
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  parsePolicyProperty,
  mdController.post()
);

router.put(
  ControllerMiddleware.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  parsePolicyProperty,
  mdController.put()
);

router.delete(
  ControllerMiddleware.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  mdController.delete()
);

export const DynamicConfigController: Router = router;