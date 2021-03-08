import { MultipartMiddleware } from './../../middlewares/multipart';
import { AuthMiddleware } from './auth.middleware';
import { AppMiddleware } from './../app/app.middleware';
import { ProfileModel } from './profile.model';
import { ProfileControllerMiddleware } from './profile.middelware.controller';
import { Router } from 'express';
let debug = require('debug')('app:controller:step');

const router: Router = Router();

let mdController = new ProfileControllerMiddleware(ProfileModel);

router.get('/current',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getCurrentProfile()
);

router.get(ProfileControllerMiddleware.getOneRoute(),
  AppMiddleware.fetchWithPublicKey,
  //AuthMiddleware.authenticate,
  mdController.authenticateExceptForPictureDownload,
  mdController.getOne()
);

router.put(ProfileControllerMiddleware.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  MultipartMiddleware.parseDeco(<any>ProfileModel.deco),
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.put()
);


export const ProfileController: Router = router;