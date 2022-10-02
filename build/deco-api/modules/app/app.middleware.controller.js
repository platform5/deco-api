"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppControllerMiddleware = void 0;
const __1 = require("../../");
const access_middleware_controller_1 = require("../user/access.middleware.controller");
let debug = require('debug')('app:middleware:controllers:app');
class AppControllerMiddleware extends access_middleware_controller_1.AccessControllerMiddlware {
    postElement(element, req, res) {
        return super.postElement(element, req, res).then((e) => {
            let element = e;
            // create random private and public api keys
            let publicKey = __1.AppModel.generateKey();
            let privateKey = __1.AppModel.generateKey();
            element.publicKeys = [{
                    key: publicKey,
                    name: 'API Public Key'
                }];
            element.privateKeys = [{
                    key: privateKey,
                    name: 'API Private Key'
                }];
            return Promise.resolve(element);
        });
    }
    ;
}
exports.AppControllerMiddleware = AppControllerMiddleware;
//# sourceMappingURL=app.middleware.controller.js.map