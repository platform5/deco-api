"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileControllerMiddleware = void 0;
const auth_middleware_1 = require("./auth.middleware");
const profile_model_1 = require("./profile.model");
const user_model_1 = require("./user.model");
const controller_1 = require("./../../middlewares/controller");
let debug = require('debug')('app:middlewares:controllers:profile');
class ProfileControllerMiddleware extends controller_1.ControllerMiddleware {
    getCurrentProfile() {
        return (req, res, next) => {
            if (!res.locals.user)
                return next(new Error('User not found'));
            if (!res.locals.app)
                return next(new Error('App not found'));
            if (res.locals.user instanceof user_model_1.UserModel !== true)
                return next(new Error('Invalid user'));
            profile_model_1.ProfileModel.getOneWithQuery({ appId: res.locals.app._id, userId: res.locals.user._id }).then((profile) => {
                if (profile)
                    return Promise.resolve(profile);
                let newProfile = new profile_model_1.ProfileModel;
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
    authenticateExceptForPictureDownload(req, res, next) {
        if (req.query.download === 'picture')
            return next();
        return auth_middleware_1.AuthMiddleware.authenticate;
    }
}
exports.ProfileControllerMiddleware = ProfileControllerMiddleware;
//# sourceMappingURL=profile.middelware.controller.js.map