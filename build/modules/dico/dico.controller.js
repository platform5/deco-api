"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DicoController = void 0;
const dico_model_1 = require("./dico.model");
const auth_middleware_1 = require("./../user/auth.middleware");
const app_middleware_1 = require("./../app/app.middleware");
const dico_middleware_controller_1 = require("./dico.middleware.controller");
const express_1 = require("express");
const __1 = require("../../");
let debug = require('debug')('app:controller:dico');
const router = express_1.Router();
let mdController = new dico_middleware_controller_1.DicoControllerMiddleware(dico_model_1.DicoModel);
const globalContexts = ['', 'gettingStarted', 'shop', 'shops', 'error', 'info', 'confirmation', 'admin'];
const isGlobalDico = (key) => {
    if (key.indexOf('.') === -1) {
        return true;
    }
    if (globalContexts.includes(key)) {
        return true;
    }
    if (globalContexts.some((context) => {
        return key.indexOf(context + '.') === 0;
    })) {
        return true;
    }
    return false;
};
router.get('/init-translation-memory', (req, res, next) => {
    return next(new Error('Deprecated'));
});
router.get('/init-translation-memory-for-app/:appId', (req, res, next) => {
    const result = {};
    const appTMId = new __1.ObjectId('5ecd0559fd9b0400062237de');
    new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const appId = new __1.ObjectId(req.params.appId);
            const appDicoElements = yield dico_model_1.DicoModel.getAll(new __1.Query({ appId: appId }));
            const currentGlobalDicoElements = yield dico_model_1.DicoModel.getAll(new __1.Query({ appId: appTMId }));
            const existingKeys = currentGlobalDicoElements.map(e => e.key);
            result.nbDicoElementsInApp = appDicoElements.length;
            result.notGlobal = 0;
            result.existing = 0;
            result.migrated = 0;
            for (let element of appDicoElements) {
                const key = element.key;
                if (!isGlobalDico(key)) {
                    result.notGlobal++;
                    continue;
                }
                if (existingKeys.includes(key)) {
                    result.existing++;
                    continue;
                }
                existingKeys.push(element.key);
                const newElement = new dico_model_1.DicoModel();
                newElement.appId = appTMId;
                newElement.key = element.key;
                newElement.value = element.value;
                newElement.tags = element.tags || [];
                yield newElement.insert();
                result.migrated++;
            }
            const TMDicoElements = yield dico_model_1.DicoModel.getAll(new __1.Query({ appId: appTMId }));
            result.tmElements = TMDicoElements.length;
            let removedFromAppDico = 0;
            for (let tmElement of TMDicoElements) {
                const removeResult = yield dico_model_1.DicoModel.deco.db.collection(dico_model_1.DicoModel.deco.collectionName).remove({
                    appId: appId,
                    key: tmElement.key
                });
                removedFromAppDico += removeResult.result.n;
            }
            result.removedFromAppDico = removedFromAppDico;
            result.migratedPlusExisting = result.migrated + result.existing;
            result.migratedPlusExistingPlusNotGlobal = result.migrated + result.existing + result.notGlobal;
            result.ok1 = result.migratedPlusExisting === result.removedFromAppDico;
            result.ok2 = result.migratedPlusExistingPlusNotGlobal === result.nbDicoElementsInApp;
        }
        catch (error) {
            reject(error);
        }
        resolve(null);
    })).then(() => {
        res.send(result);
    }).catch(next);
});
router.get('/check-and-fix', mdController.checkAndFixDico());
router.get(__1.ControllerMiddleware.getAllRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.prepareQueryFromReq(), mdController.getAll(null, { addCountInKey: '__count', enableLastModifiedCaching: true }));
router.get('/backend', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.prepareQueryFromReq(), mdController.getAll(null, { ignoreOutput: false, ignoreSend: true, enableLastModifiedCaching: true }), mdController.combineForBackend());
router.get('/contexts', app_middleware_1.AppMiddleware.fetchWithPublicKey, mdController.prepareQueryFromReq(), mdController.getAll(null, { ignoreOutput: false, ignoreSend: true }), mdController.combineForContexts());
router.get(__1.ControllerMiddleware.getOneRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.getOne());
/* For the dico the POST route can also edit data */
/* It will either create a document if the key doesn't exists
   or update it if it already exists */
router.post(__1.ControllerMiddleware.postRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticateWithoutError, dico_middleware_controller_1.DicoControllerMiddleware.validateKey(), 
// AppMiddleware.addAppIdToBody('appId'),
mdController.post());
router.put(__1.ControllerMiddleware.putRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticateWithoutError, dico_middleware_controller_1.DicoControllerMiddleware.validateKey(), 
// AppMiddleware.addAppIdToBody('appId'),
mdController.put());
router.delete(__1.ControllerMiddleware.deleteRoute(), app_middleware_1.AppMiddleware.fetchWithPublicKey, auth_middleware_1.AuthMiddleware.authenticate, mdController.delete());
exports.DicoController = router;
//# sourceMappingURL=dico.controller.js.map