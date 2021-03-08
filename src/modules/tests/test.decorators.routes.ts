import { MultipartMiddleware } from './../../middlewares/multipart';
import { TestDecoratorsModel } from './decorators';
import { ControllerMiddleware } from './../../middlewares/controller';
import { Router } from 'express';
let debug = require('debug')('app:controller:test:decorators');

const router: Router = Router();

let mdController = new ControllerMiddleware(TestDecoratorsModel);

router.get(
  ControllerMiddleware.getAllRoute(),
  mdController.prepareQueryFromReq(),
  mdController.getAll(null, {ignoreOutput: false, ignoreSend: true}),
  mdController.autoFetch([])
);

router.get(
  ControllerMiddleware.getOneRoute(),
  mdController.getOne()
);

router.post(
  ControllerMiddleware.postRoute(),
  MultipartMiddleware.parseDeco(<any>TestDecoratorsModel.deco),
  mdController.post()
);

router.put(
  ControllerMiddleware.putRoute(),
  MultipartMiddleware.parseDeco(<any>TestDecoratorsModel.deco),
  mdController.put()
);

router.delete(
  ControllerMiddleware.deleteRoute(),
  mdController.delete()
);

export const TestDecoratorsController: Router = router;