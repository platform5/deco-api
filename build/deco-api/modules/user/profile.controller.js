"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const multipart_1 = require("./../../middlewares/multipart");
const auth_middleware_1 = require("./auth.middleware");
const app_middleware_1 = require("./../app/app.middleware");
const profile_model_1 = require("./profile.model");
const profile_middelware_controller_1 = require("./profile.middelware.controller");
const express_1 = require("express");
let debug = require('debug')('app:controller:step');
const router = express_1.Router();
let mdController = new profile_middelware_controller_1.ProfileControllerMiddleware(profile_model_1.ProfileModel);
router.get('/current', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getCurrentProfile());
router.get(profile_middelware_controller_1.ProfileControllerMiddleware.getOneRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, 
//AuthMiddleware.authenticate,
mdController.authenticateExceptForPictureDownload, mdController.getOne());
router.put(profile_middelware_controller_1.ProfileControllerMiddleware.putRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, multipart_1.MultipartMiddleware.parseDeco(profile_model_1.ProfileModel.deco), 
// AppMiddleware.addAppIdToBody('appId'),
mdController.put());
exports.ProfileController = router;
//# sourceMappingURL=profile.controller.js.map