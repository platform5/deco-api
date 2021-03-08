import { DicoModel } from './dico.model';
import { AuthMiddleware } from './../user/auth.middleware';
import { AppMiddleware } from './../app/app.middleware';
import { DicoControllerMiddleware } from './dico.middleware.controller';
import { Router, Request, Response, NextFunction } from 'express';
import { ControllerMiddleware, Query,  ObjectId } from '../../';
let debug = require('debug')('app:controller:dico');

const router: Router = Router();

let mdController = new DicoControllerMiddleware(DicoModel);

const globalContexts = ['', 'gettingStarted', 'shop', 'shops', 'error', 'info', 'confirmation', 'admin'];
const isGlobalDico = (key: string) => {
  if (key.indexOf('.') === -1) {
    return true;
  }
  if (globalContexts.includes(key)) {
    return true;
  }
  if (globalContexts.some((context) => {
    return key.indexOf(context + '.') === 0
  })) {
    return true;
  }
  return false;
}

router.get('/init-translation-memory', (req: Request, res: Response, next: NextFunction) => {
  return next(new Error('Deprecated'));
});

router.get('/init-translation-memory-for-app/:appId', (req: Request, res: Response, next: NextFunction) => {
  const result: any = {};
  const appTMId = new ObjectId('5ecd0559fd9b0400062237de');
  new Promise(async (resolve, reject) => {
    try {
      const appId = new ObjectId(req.params.appId);
      const appDicoElements = await DicoModel.getAll(new Query({appId: appId}));
      const currentGlobalDicoElements = await DicoModel.getAll(new Query({appId: appTMId}));

      const existingKeys = currentGlobalDicoElements.map(e => e.key);
  
      result.nbDicoElementsInApp = appDicoElements.length;
      result.notGlobal = 0;
      result.existing = 0;
      result.migrated = 0;
      for (let element of appDicoElements) {
        const key = element.key;
        if (!isGlobalDico(key)) {
          result.notGlobal++;
          continue;
        }
        if (existingKeys.includes(key)) {
          result.existing++;
          continue;
        }
        existingKeys.push(element.key);
        const newElement = new DicoModel();
        newElement.appId = appTMId;
        newElement.key = element.key;
        newElement.value = element.value;
        newElement.tags = element.tags || [];
        await newElement.insert();
        result.migrated++;
      }
      const TMDicoElements = await DicoModel.getAll(new Query({appId: appTMId}));
      result.tmElements = TMDicoElements.length;
      let removedFromAppDico = 0;
      for (let tmElement of TMDicoElements) {
        const removeResult = await DicoModel.deco.db.collection(DicoModel.deco.collectionName).remove({
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
    } catch (error) {
      reject(error);
    }
    resolve(null);
  }).then(() => {
    res.send(result);
  }).catch(next);
});

router.get('/check-and-fix', mdController.checkAndFixDico())

router.get(
  ControllerMiddleware.getAllRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.prepareQueryFromReq(),
  mdController.getAll(null, {addCountInKey: '__count', enableLastModifiedCaching: true})
);

router.get(
  '/backend',
  AppMiddleware.fetchWithPublicKey,
  mdController.prepareQueryFromReq(),
  mdController.getAll(null, {ignoreOutput: false, ignoreSend: true, enableLastModifiedCaching: true}),
  mdController.combineForBackend()
);

router.get(
  '/contexts',
  AppMiddleware.fetchWithPublicKey,
  mdController.prepareQueryFromReq(),
  mdController.getAll(null, {ignoreOutput: false, ignoreSend: true}),
  mdController.combineForContexts()
);

router.get(
  ControllerMiddleware.getOneRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.getOne()
);

/* For the dico the POST route can also edit data */
/* It will either create a document if the key doesn't exists
   or update it if it already exists */
router.post(
  ControllerMiddleware.postRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  DicoControllerMiddleware.validateKey(),
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.post()
);

router.put(
  ControllerMiddleware.putRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticateWithoutError,
  DicoControllerMiddleware.validateKey(),
  // AppMiddleware.addAppIdToBody('appId'),
  mdController.put()
);

router.delete(
  ControllerMiddleware.deleteRoute(),
  AppMiddleware.fetchWithPublicKey,
  AuthMiddleware.authenticate,
  mdController.delete()
);

export const DicoController: Router = router;