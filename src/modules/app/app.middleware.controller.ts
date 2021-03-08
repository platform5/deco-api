import { Model, AppModel } from '../../';
import { AccessControllerMiddlware } from '../user/access.middleware.controller';
import { Request, Response } from 'express';
let debug = require('debug')('app:middleware:controllers:app');

export class AppControllerMiddleware extends AccessControllerMiddlware {
  postElement (element: AppModel, req: Request, res: Response): Promise<Model> {
    return super.postElement(element, req, res).then((e) => {
      let element: AppModel = (e as AppModel);
      // create random private and public api keys
      let publicKey = AppModel.generateKey();
      let privateKey = AppModel.generateKey();
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
  };

  
}