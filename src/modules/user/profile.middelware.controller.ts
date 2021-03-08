import { AuthMiddleware } from './auth.middleware';
import { ProfileModel } from './profile.model';
import { UserModel } from './user.model';
import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:middlewares:controllers:profile');

export class ProfileControllerMiddleware extends ControllerMiddleware {

  getCurrentProfile() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.user) return next(new Error('User not found'));
      if (!res.locals.app) return next(new Error('App not found'));
      if (res.locals.user instanceof UserModel !== true) return next(new Error('Invalid user'));
      ProfileModel.getOneWithQuery({appId: res.locals.app._id, userId: res.locals.user._id}).then((profile) => {
        if (profile) return Promise.resolve(profile);
        let newProfile = new ProfileModel;
        newProfile.appId = res.locals.app._id;
        newProfile.userId = res.locals.user._id;
        return newProfile.insert();
      }).then((profile) => {
        return profile.output();
      }).then((profile) => {
        res.send(profile);
      });
    };
  }

  authenticateExceptForPictureDownload(req: Request, res: Response, next: NextFunction) {
    if (req.query.download === 'picture') return next();
    return AuthMiddleware.authenticate
  }
}