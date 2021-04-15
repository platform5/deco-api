import { DicoModel } from './dico.model';
import { AccessControllerMiddlware } from './../user/access.middleware.controller';
import { Request, Response, NextFunction } from 'express';
import { Model, ObjectId, Query, StringAnyMap } from '../../';
import fs from 'fs';
import moment from 'moment';
let debug = require('debug')('app:middleware:controllers:dico');

export class DicoControllerMiddleware extends AccessControllerMiddlware {

  static validateKey() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'POST' && req.method !== 'PUT') {
        return next();
      }
      if (!res.locals.app) {
        return next(new Error('Missing app'));
      }
      if (req.body.key && req.body.key.length) {
        const key = req.body.key;
        // check that the key doesnt end with '.'
        if (key.slice(-1) === '.') {
          const reason = 'Should not end with "."';
          DicoControllerMiddleware.logInvalidKey(res.locals.app._id, key, reason);
          return next(new Error('Invalid key: ' + reason));
        }
        const parts = key.split('.');
        const finalKey = parts.pop();
        const context = parts.join('.');
        // check that the context doesnt start with an uppercase
        if (context.length) {
          if ('abcdefghijklmnopqrstuvwxyz'.indexOf(context[0]) === -1) {
            const reason = 'Context must start with a lowercase';
            DicoControllerMiddleware.logInvalidKey(res.locals.app._id, key, reason);
            return next(new Error('Invalid key: ' + reason));
          }
        }
        if (context.length === 0 && 'abcdefghijklmnopqrstuvwxyz'.indexOf(context[0]) !== -1) {
          const reason = 'Key without context must not start with a lowercase';
          DicoControllerMiddleware.logInvalidKey(res.locals.app._id, key, reason);
          return next(new Error('Invalid key: ' + reason));
        }
        // check that the key is not a context nor the context a key
        const regex = new RegExp(`^${key}\\.(.*)`);
        const query = new Query({$or: [
          {key: {$regex: regex}},
          {key: context}
        ]})

        query.addQuery({appId: new ObjectId(req.body.appId)})
        
        if (req.method === 'PUT') {
          query.addQuery({_id: {$ne: new ObjectId(req.params.elementId)}});
        }

        return DicoModel.getOneWithQuery(query).then((foundElement) => {
          if (foundElement && foundElement.key === context) {
            const reason = 'The context is identical to a current key';
            DicoControllerMiddleware.logInvalidKey(res.locals.app._id, key, reason);
            throw new Error('Invalid key: ' + reason);
          } else if (foundElement) {
            const reason = 'The key is identical to a current context';
            DicoControllerMiddleware.logInvalidKey(res.locals.app._id, key, reason);
            throw new Error('Invalid key: ' + reason);
          }
          // check that the context is not a key
          return DicoModel.getOneWithQuery({key: context})
        }).then(() => {
          return next();
        }).catch(next);
      }
      return next();
    }
  }

  static logInvalidKey(appId: ObjectId, key: string, reason: string) {
    const date = moment().format('YYYY-MM-DD_HH:mm:ss');
    const line = `${date};${appId.toHexString()};${key};${reason}`;
    fs.writeFileSync('logs/invalid-dico-elements.csv', line, {flag: 'a'})
  }

  post(options = {ignoreOutput: false, ignoreSend: false}) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      let postFunc = super.post(options);
      let putFunc = super.put(options);

      if (!req.body || !req.body.key) {
        postFunc(req, res, next);
      } else {
        return this.model.getOneWithQuery({key: req.body.key, appId: res.locals.app._id}).then((element) => {
          if (element) {
            // INFO
            // In the past we had the commented code below in order to
            // edit the current key
            // However this has caused too many problems. So now we
            // prefer to disable POST if the element already
            // exists and not make any PUT (edit)
            //if (!req.params) req.params = {};
            //req.params.elementId = element._id.toString();
            //req.body.appId = (element as any).appId.toString();
            //putFunc(req, res, next);
            res.sendStatus(204);
          } else {
            postFunc(req, res, next);
          }
        }).catch(next);
      }
    };
  }

  public combineForBackend() {
    return (req: Request, res: Response, next: NextFunction) => {

      if (res.headersSent) {
        return next();
      }

      if (!res.locals.elements || !Array.isArray(res.locals.elements)) return res.send({});
      
      let backendStructure: StringAnyMap = {};
      for (let element of res.locals.elements) {
        backendStructure[element.key] = element.value;
      }

      // iterate over the property names
      Object.keys(backendStructure).forEach(function(k) {
        // slip the property value based on `.`
        let prop = k.split('.');
        if (prop.length > 1) {
          // get the last value fom array
          let last: string = (prop.pop() as string);
          // iterate over the remaining array value 
          // and define the object if not already defined
          prop.reduce(function(o, key) {
            // define the object if not defined and return
            return o[key] = o[key] || {};
            // set initial value as object
            // and set the property value
          }, backendStructure)[last] = backendStructure[k];
          // delete the original property from object
          delete backendStructure[k];
        }
      });

      res.send(backendStructure);
    };
  }

  public combineForContexts() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.elements || !Array.isArray(res.locals.elements)) return res.send([]);
      let contexts: string[] = [];
      for (let element of res.locals.elements) {
        const parts: string[] = element.key.split('.');
        parts.pop();
        const context = parts.join('.');
        if (!contexts.includes(context)) {
          contexts.push(context);
        }
      }
      res.send(contexts);
    };
  }

  public checkAndFixDico() {
    return (req: Request, res: Response, next: NextFunction) => {
      const result: any = {};
      const fix = req.query.fix;
      result.errors = [];
      new Promise(async (resolve, reject) => {
        try {

          const dotElements = await DicoModel.getAll(new Query({key: {$regex: /\.$/}}));

          result.dotErrors = dotElements.length;

          const lowercaseKeyQuery = new Query();
          lowercaseKeyQuery.addQuery({key: {$regex: /^[A-Z]/}});
          lowercaseKeyQuery.addQuery({key: {$regex: /\./}});
          const lowercaseKeyElements = await DicoModel.getAll(lowercaseKeyQuery);

          result.lowercaseKeyErrors = lowercaseKeyElements.length;

          const elements = await DicoModel.getAll();
          const keyAsContextElements: DicoModel[] = [];
          const contextAsKeyElements: DicoModel[] = [];
          for (let element of elements) {
            const key = element.key;
            const parts = key.split('.');
            const finalKey = parts.pop();
            const context = parts.join('.');
            // check that the key is not a context nor the context a key
            const regex = new RegExp(`^${key}\\.`);
            const query = new Query();
            query.addQuery({$or: [
              {key: {$regex: regex}},
              {key: context}
            ]});
            query.addQuery({appId: element.appId});
            query.addQuery({_id: {$ne: element._id}})
            const foundElements = await DicoModel.getAll(query);
            for (const foundElement of foundElements) {
              if (key === context) {
                contextAsKeyElements.push(foundElement);
              } else {
                keyAsContextElements.push(foundElement);
              }
            }
          }
          result.contextAsKeyErrors = contextAsKeyElements.length;
          result.keyAsContextErrors = keyAsContextElements.length;

          if (fix) {
            const ids: ObjectId[] = [];
            for (let el of dotElements) {
              ids.push(el._id);
            }
            for (let el of lowercaseKeyElements) {
              ids.push(el._id);
            }
            for (let el of contextAsKeyElements) {
              ids.push(el._id);
            }
            for (let el of keyAsContextElements) {
              ids.push(el._id);
            }
            result.removeIdsLength = ids.length;
            result.removedIds = ids.map(i => i.toHexString());
            await DicoModel.deco.db.collection(DicoModel.deco.collectionName).remove({_id: {$in: ids}});
          }
          
          resolve(null);
        } catch (error) {
          reject(error);
        }
      }).then(() => {
        res.send(result);
      }).catch(next);
    };
  }
}