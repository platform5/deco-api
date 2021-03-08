"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const model_hits_controller_1 = require("./../model-hits/model.hits.controller");
const user_model_1 = require("./../user/user.model");
const app_middleware_1 = require("./../app/app.middleware");
const dynamic2_middleware_controller_1 = require("./dynamic2.middleware.controller");
const dynamicdata2_model_1 = require("./dynamicdata2.model");
const express_1 = require("express");
let debug = require('debug')('app:controller:dynamicdata');
const router = express_1.Router();
let dynamic2Controller = new dynamic2_middleware_controller_1.Dynamic2MiddlwareController(dynamicdata2_model_1.DynamicDataModel2);
router.get(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getAllRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, dynamic2Controller.prepareQueryFromReq(), 
//dynamic2Controller.getAll()
dynamic2Controller.getAll(null, { ignoreOutput: false, ignoreSend: true, addCountInKey: '__count' }), dynamic2Controller.autoFetch([
    {
        originalKey: '_createdBy',
        destinationKey: 'user',
        matchingKeyInRelatedModel: '_id',
        model: user_model_1.UserModel,
        includeModelProp: ['firstname', 'lastname']
    }
]));
router.get(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getOneRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, model_hits_controller_1.ModelHitsMiddleware.singleHit('dynamic'), dynamic2Controller.getOne());
router.get(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.getOneRoute() + '/stats', app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, model_hits_controller_1.ModelHitsMiddleware.singleStats('dynamic'));
router.post(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.postRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.multipartWrapper, 
// AppMiddleware.addAppIdToBody('appId'),
dynamic2Controller.post({ ignoreOutput: false, ignoreSend: true }), model_hits_controller_1.ModelHitsMiddleware.singleHit('dynamic'), dynamic2Controller.sendLocals('element'));
router.put(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.putRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, model_hits_controller_1.ModelHitsMiddleware.singleHit('dynamic'), dynamic2_middleware_controller_1.Dynamic2MiddlwareController.multipartWrapper, dynamic2Controller.put());
router.delete(dynamic2_middleware_controller_1.Dynamic2MiddlwareController.deleteRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.placeDynamicConfigInRequest, dynamic2_middleware_controller_1.Dynamic2MiddlwareController.authenticateAndErrorOnlyIfNotPublic, model_hits_controller_1.ModelHitsMiddleware.singleHit('dynamic'), dynamic2Controller.delete());
exports.DynamicDataController = router;
//# sourceMappingURL=dynamicdata.controller.js.map