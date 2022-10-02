"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDecoratorsController = void 0;
const multipart_1 = require("./../../middlewares/multipart");
const decorators_1 = require("./decorators");
const controller_1 = require("./../../middlewares/controller");
const express_1 = require("express");
let debug = require('debug')('app:controller:test:decorators');
const router = express_1.Router();
let mdController = new controller_1.ControllerMiddleware(decorators_1.TestDecoratorsModel);
router.get(controller_1.ControllerMiddleware.getAllRoute(), mdController.prepareQueryFromReq(), mdController.getAll(null, { ignoreOutput: false, ignoreSend: true }), mdController.autoFetch([]));
router.get(controller_1.ControllerMiddleware.getOneRoute(), mdController.getOne());
router.post(controller_1.ControllerMiddleware.postRoute(), multipart_1.MultipartMiddleware.parseDeco(decorators_1.TestDecoratorsModel.deco), mdController.post());
router.put(controller_1.ControllerMiddleware.putRoute(), multipart_1.MultipartMiddleware.parseDeco(decorators_1.TestDecoratorsModel.deco), mdController.put());
router.delete(controller_1.ControllerMiddleware.deleteRoute(), mdController.delete());
exports.TestDecoratorsController = router;
//# sourceMappingURL=test.decorators.routes.js.map