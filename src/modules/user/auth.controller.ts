import { AuthMiddleware } from './auth.middleware';
import { AppMiddleware } from './../app/app.middleware';
import { Router, Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:controller:auth');

const router: Router = Router();
router.post(
  '/token',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.getToken
);

router.post(
  '/revoke-token',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.revokeToken
)

router.post(
  '/authenticated',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  (req: Request, res: Response, next: NextFunction) => {
    if (res.locals.app && res.locals.user) return res.sendStatus(204);
    next(new Error('Authentication failed'))
  }
)

router.post(
  '/forgot-password',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.forgotPassword
)

router.put(
  '/reset-password',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.resetPassword
)

router.put(
  '/password-change',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.passwordChange
)

router.put(
  '/request-email-change',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.requestEmailOrMobileChange('email')
)

router.put(
  '/request-mobile-change',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.requestEmailOrMobileChange('mobile')
)

router.put(
  '/validate-email-change',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.validateEmailOrMobileChange('email')
)

router.put(
  '/validate-mobile-change',
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  AuthMiddleware.validateEmailOrMobileChange('mobile')
)



export const AuthController: Router = router;