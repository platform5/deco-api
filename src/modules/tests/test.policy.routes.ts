import { AuthMiddleware } from './../user/auth.middleware';
import { PolicyFactory } from './../user/policy/policy.factory';
import { AppMiddleware } from './../app/app.middleware';
import { DataModel } from './data.model';
import { PolicyController } from './../user/policy/policy.controller';
import { Router, Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:controller:test:policy');

const router: Router = Router();

let mdController = new  PolicyController(DataModel);

type FN = (req: Request, res: Response, next: NextFunction) => void;

const asyncMiddleware = (fn: FN) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error(error);
    next(error)
  });
};

router.get(
  '/authenticated',
  AppMiddleware.fetchWithPublicKey,
  (req, res, next) => {
    next();
  },
  mdController.addPolicy(PolicyFactory.authenticate()),
  (req, res, next) => {
    next();
  },
  asyncMiddleware(mdController.checkRoutePolicy()),
  (req, res, next) => {
    next();
  },
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  '/roles',
  AppMiddleware.fetchWithPublicKey,
  mdController.addPolicy(PolicyFactory.userRole(['test'], 'include')),
  asyncMiddleware(mdController.checkRoutePolicy()),
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  '/project-member/:projectId',
  AppMiddleware.fetchWithPublicKey,
  mdController.addPolicy(PolicyFactory.projectMember('reader')),
  asyncMiddleware(mdController.checkRoutePolicy()),
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  '/api-key',
  AppMiddleware.fetchWithPublicKey,
  mdController.addPolicy(PolicyFactory.apiKey()),
  asyncMiddleware(mdController.checkRoutePolicy()),
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.post(
  '/create',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.post()
);

router.get(
  '/all',
  AppMiddleware.fetchWithPublicKey,
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  '/owner',
  AppMiddleware.fetchWithPublicKey,
  mdController.addPolicy(PolicyFactory.owner()),
  mdController.prepareQueryFromReq(),
  mdController.getAll()
);

router.get(
  '/owner/:elementId',
  AppMiddleware.fetchWithPublicKey,
  mdController.addPolicy(PolicyFactory.owner()),
  mdController.getOne()
);



export const TestPolicyController: Router = router;