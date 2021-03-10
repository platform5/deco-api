"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const controller_1 = require("./../../middlewares/controller");
const profile_model_1 = require("./profile.model");
const auth_middleware_1 = require("./auth.middleware");
const app_middleware_1 = require("./../app/app.middleware");
const user_model_1 = require("./user.model");
const user_middleware_controller_1 = require("./user.middleware.controller");
const express_1 = require("express");
let debug = require('debug')('app:controller:user');
const router = express_1.Router();
let mdController = new user_middleware_controller_1.UserControllerMiddleware(user_model_1.UserModel);
router.get('/user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkUserRoleAccess('adminUserRoles'), mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdInQuery, mdController.getAll());
router.get('/app/:appId/user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdFromParamsToQuery, mdController.getAll());
router.get('/app/:appId/parent-user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, app_middleware_1.AppMiddleware.fetchParamApp(), auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdInQuery, mdController.onlyUsersInvitedInParamApp, mdController.getAll(null, { ignoreSend: true }), mdController.outputParamAppRoles);
// this request (below) must be depracated.
// It is currently used in Mintello Client and ECV2 Client
router.get('/app/:appId/search-user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticateWithoutError, app_middleware_1.AppMiddleware.fetchParamApp(false), mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdFromParamsToQuery, mdController.getAll(null, { ignoreSend: true, ignoreOutput: false }), mdController.autoFetch([
    {
        originalKey: 'id',
        matchingKeyInRelatedModel: 'userId',
        destinationKey: 'profile',
        model: profile_model_1.ProfileModel,
        includeModelProp: ['picture']
    }
], false), mdController.outputSearch);
router.get('/search-user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticateWithoutError, mdController.prepareQueryFromReq(), auth_middleware_1.AuthMiddleware.addAppIdInQuery, mdController.getAll(null, { ignoreSend: true, ignoreOutput: false, addCountInKey: '__count' }), mdController.autoFetch([
    {
        originalKey: 'id',
        matchingKeyInRelatedModel: 'userId',
        destinationKey: 'profile',
        model: profile_model_1.ProfileModel,
        includeModelProp: ['picture']
    }
], false), mdController.outputSearch);
router.get('/user/current', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getCurrentUser());
router.get('/user/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkUserRoleAccess('adminUserRoles'), mdController.getOne());
router.get('/app/:appId/user/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), 
//AuthMiddleware.allowOnlyRoles(['admin']),
mdController.getOne());
router.post('/user/create-account', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.validateAndPost());
router.put('/user/resend-code', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.resendCode);
router.put('/user/create-account', app_middleware_1.AppMiddleware.fetchWithPublicKey, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.validateAndPost());
router.post('/user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkUserRoleAccess('adminUserRoles'), 
// AppMiddleware.addAppIdToBody('appId'),
mdController.post());
router.post('/app/:appId/user', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), mdController.post());
router.put('/user/hide-onboarding', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.hideOnboarding);
router.put('/user/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, 
// AppMiddleware.addAppIdToBody('appId'),
mdController.put());
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
router.delete(controller_1.ControllerMiddleware.deleteRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkUserRoleAccess('adminUserRoles'), 
// AppMiddleware.addAppIdToBody('appId'),
mdController.delete());
router.delete('/app/:appId/user/:elementId', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.checkRoleViaParamApp(['admin', 'user']), app_middleware_1.AppMiddleware.addAppIdFromParamsToBody('appId'), mdController.delete());
router.get('/user/exists/:type/:value', app_middleware_1.AppMiddleware.fetchWithPublicKey, (req, res, next) => {
    if (req.params.type !== 'email' && req.params.type !== 'mobile')
        return next(new Error('Invalid request'));
    let query = { appId: res.locals.app._id };
    query[req.params.type] = req.params.value;
    user_model_1.UserModel.getOneWithQuery(query).then((user) => {
        if (user)
            return res.send({ exists: true, id: user._id });
        return res.send({ exists: false });
    });
});
exports.UserController = router;
//# sourceMappingURL=user.controller.js.map