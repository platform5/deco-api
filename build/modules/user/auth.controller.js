"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_middleware_1 = require("./auth.middleware");
const app_middleware_1 = require("./../app/app.middleware");
const express_1 = require("express");
let debug = require('debug')('app:controller:auth');
const router = express_1.Router();
router.post('/token', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.getToken);
router.post('/revoke-token', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.revokeToken);
router.post('/authenticated', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, (req, res, next) => {
    if (res.locals.app && res.locals.user)
        return res.sendStatus(204);
    next(new Error('Authentication failed'));
});
router.post('/forgot-password', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.forgotPassword);
router.put('/reset-password', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.resetPassword);
router.put('/password-change', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.passwordChange);
router.put('/request-email-change', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requestEmailOrMobileChange('email'));
router.put('/request-mobile-change', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.requestEmailOrMobileChange('mobile'));
router.put('/validate-email-change', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.validateEmailOrMobileChange('email'));
router.put('/validate-mobile-change', app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, auth_middleware_1.AuthMiddleware.validateEmailOrMobileChange('mobile'));
exports.AuthController = router;
//# sourceMappingURL=auth.controller.js.map