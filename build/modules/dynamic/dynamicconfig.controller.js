"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicConfigController = void 0;
const controller_1 = require("./../../middlewares/controller");
const dynamicconfig_model_1 = require("./dynamicconfig.model");
const access_middleware_controller_1 = require("./../user/access.middleware.controller");
const express_1 = require("express");
const __1 = require("..");
let debug = require('debug')('app:controller:data');
const router = express_1.Router();
let parsePolicyProperty = (req, res, next) => {
    if (req.body && req.body.policy && typeof req.body.policy === 'string') {
        try {
            req.body.policy = JSON.parse(req.body.policy);
        }
        catch (error) {
            return next(new Error('Invalid JSON value in policy property'));
        }
    }
    return next();
};
let mdController = new access_middleware_controller_1.AccessControllerMiddlware(dynamicconfig_model_1.DynamicConfigModel);
mdController.enableRelatedToAppId = true;
router.get(controller_1.ControllerMiddleware.getAllRoute(), __1.AppMiddleware.fetchWithPublicKey, mdController.prepareQueryFromReq(), mdController.getAll(null, { enableLastModifiedCaching: true }));
router.get(controller_1.ControllerMiddleware.getOneRoute(), __1.AppMiddleware.fetchWithPublicKey, mdController.getOne());
router.post(controller_1.ControllerMiddleware.postRoute(), __1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
parsePolicyProperty, mdController.post());
router.put(controller_1.ControllerMiddleware.putRoute(), __1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
parsePolicyProperty, mdController.put());
router.delete(controller_1.ControllerMiddleware.deleteRoute(), __1.AppMiddleware.fetchWithPublicKey, mdController.delete());
exports.DynamicConfigController = router;
//# sourceMappingURL=dynamicconfig.controller.js.map