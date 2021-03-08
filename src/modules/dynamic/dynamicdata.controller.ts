import { ModelHitsMiddleware } from './../model-hits/model.hits.controller';
import { UserModel } from './../user/user.model';
import { AppMiddleware } from './../app/app.middleware';
import { Dynamic2MiddlwareController } from './dynamic2.middleware.controller';
import { DynamicDataModel2 } from './dynamicdata2.model';
import { Router } from 'express';
let debug = require('debug')('app:controller:dynamicdata');

const router: Router = Router();

let dynamic2Controller = new Dynamic2MiddlwareController(DynamicDataModel2);

router.get(
  Dynamic2MiddlwareController.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  dynamic2Controller.prepareQueryFromReq(),
  //dynamic2Controller.getAll()
  dynamic2Controller.getAll(null, {ignoreOutput: false, ignoreSend: true, addCountInKey: '__count'}),
  dynamic2Controller.autoFetch([
    {
      originalKey: '_createdBy',
      destinationKey: 'user',
      matchingKeyInRelatedModel: '_id',
      model: UserModel,
      includeModelProp: ['firstname', 'lastname']
    }
  ])
);

router.get(
  Dynamic2MiddlwareController.getOneRoute(),
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  ModelHitsMiddleware.singleHit('dynamic'),
  dynamic2Controller.getOne()
);

router.get(
  Dynamic2MiddlwareController.getOneRoute() + '/stats',
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  ModelHitsMiddleware.singleStats('dynamic')
);

router.post(
  Dynamic2MiddlwareController.postRoute(),
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  Dynamic2MiddlwareController.multipartWrapper,
  // AppMiddleware.addAppIdToBody('appId'),
  dynamic2Controller.post({ignoreOutput: false, ignoreSend: true}),
  ModelHitsMiddleware.singleHit('dynamic'),
  dynamic2Controller.sendLocals('element')
);

router.put(
  Dynamic2MiddlwareController.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  ModelHitsMiddleware.singleHit('dynamic'),
  Dynamic2MiddlwareController.multipartWrapper,
  dynamic2Controller.put()
);

router.delete(
  Dynamic2MiddlwareController.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  Dynamic2MiddlwareController.placeDynamicConfigInRequest,
  Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic,
  ModelHitsMiddleware.singleHit('dynamic'),
  dynamic2Controller.delete()
);

export const DynamicDataController: Router = router;