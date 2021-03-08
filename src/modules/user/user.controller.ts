import { ControllerMiddleware } from './../../middlewares/controller';
import { ProfileModel } from './profile.model';
import { AuthMiddleware } from './auth.middleware';
import { AppMiddleware } from './../app/app.middleware';
import { UserModel } from './user.model';
import { UserControllerMiddleware } from './user.middleware.controller';
import { Router, Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:controller:user');

const router: Router = Router();

let mdController = new UserControllerMiddleware(UserModel);

router.get(
  '/user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserRoleAccess('adminUserRoles'),
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdInQuery,
  mdController.getAll()
);

router.get(
  '/app/:appId/user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdFromParamsToQuery,
  mdController.getAll()
);

router.get(
  '/app/:appId/parent-user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AppMiddleware.fetchParamApp(),
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdInQuery,
  mdController.onlyUsersInvitedInParamApp,
  mdController.getAll(null, {ignoreSend: true}),
  mdController.outputParamAppRoles
  )

// this request (below) must be depracated.
// It is currently used in Mintello Client and ECV2 Client
router.get(
  '/app/:appId/search-user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  AppMiddleware.fetchParamApp(false),
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdFromParamsToQuery,
  mdController.getAll(null, {ignoreSend: true, ignoreOutput: false}),
  mdController.autoFetch([
    {
      originalKey: 'id',
      matchingKeyInRelatedModel: 'userId',
      destinationKey: 'profile',
      model: ProfileModel,
      includeModelProp: ['picture']
    }
  ], false),
  mdController.outputSearch
);

router.get(
  '/search-user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  mdController.prepareQueryFromReq(),
  AuthMiddleware.addAppIdInQuery,
  mdController.getAll(null, {ignoreSend: true, ignoreOutput: false, addCountInKey: '__count'}),
  mdController.autoFetch([
    {
      originalKey: 'id',
      matchingKeyInRelatedModel: 'userId',
      destinationKey: 'profile',
      model: ProfileModel,
      includeModelProp: ['picture']
    }
  ], false),
  mdController.outputSearch
);

router.get(
  '/user/current',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getCurrentUser()
)

router.get(
  '/user/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserRoleAccess('adminUserRoles'),
  mdController.getOne()
);

router.get(
  '/app/:appId/user/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  //AuthMiddleware.allowOnlyRoles(['admin']),
  mdController.getOne()
);

router.post(
  '/user/create-account',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.validateAndPost()
);

router.put(
  '/user/resend-code',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.resendCode
);

router.put(
  '/user/create-account',
  AppMiddleware.fetchWithPublicKey,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.validateAndPost()
);

router.post(
  '/user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserRoleAccess('adminUserRoles'),
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.post()
);

router.post(
  '/app/:appId/user',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  mdController.post()
);

router.put(
  '/user/hide-onboarding',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.hideOnboarding
)

router.put(
  '/user/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.put()
);



// this route is not taken care of in the app controller
// and is only used to edit the roles of a user
// router.put(
//   '/app/:appId/user/:elementId',
//   AppMiddleware.fetchWithPublicKey,
//   AuthMiddleware.authenticate,
//   AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
//   AppMiddleware.addAppIdFromParamsToBody('appId'),
//   mdController.put()
// );

router.delete(
  ControllerMiddleware.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkUserRoleAccess('adminUserRoles'),
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.delete()
);

router.delete(
  '/app/:appId/user/:elementId',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.checkRoleViaParamApp(['admin', 'user']),
  AppMiddleware.addAppIdFromParamsToBody('appId'),
  mdController.delete()
);

router.get('/user/exists/:type/:value', AppMiddleware.fetchWithPublicKey, (req: Request, res: Response, next: NextFunction) => {
  if (req.params.type !== 'email' && req.params.type !== 'mobile') return next(new Error('Invalid request'));
  let query: any = {appId: res.locals.app._id};
  query[req.params.type] = req.params.value;
  UserModel.getOneWithQuery(query).then((user) => {
    if (user) return res.send({exists: true, id: user._id});
    return res.send({exists: false});
  });
});

export const UserController: Router = router;