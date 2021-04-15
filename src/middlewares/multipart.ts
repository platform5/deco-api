import { StringAnyMap } from './../interfaces/types';
import { Deco } from './../interfaces';
import { Model } from './../decorators/model';
import { Settings } from '../helpers/settings';
import multer from 'multer';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import mkdirp from 'mkdirp';
import crypto from 'crypto';
let debug = require('debug')('deco-api:middlewares:multipart');

export interface MultipartRequest extends Request {
  filesPropertyOptions?: StringAnyMap;
}

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let options = (req as MultipartRequest).filesPropertyOptions;
    let fieldname = file.fieldname;
    if (fieldname.substr(Settings.filePreviewSuffix.length * -1) === Settings.filePreviewSuffix) {
      fieldname = fieldname.substr(0, fieldname.length - Settings.filePreviewSuffix.length);
    }
    if (options && options[fieldname] && options[fieldname].destination && typeof options[fieldname].destination === 'string' ) {
      mkdirp.sync(options[fieldname].destination);
      cb(null, options[fieldname].destination);
    } else {
      cb(null, 'uploads/')
    }
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) cb(err, '');
      else cb(null, raw.toString('hex'));
    });
  }
});

let fileFilter = (req: Request, file: any, cb: Function) => {
  let options = (req as MultipartRequest).filesPropertyOptions;
  let filter = true;

  let suff = Settings.filePreviewSuffix;

  if (file.fieldname.substr(suff.length * -1) === suff) {
    // this is a preview field
    let ok = new RegExp('image/*').test(file.mimetype);
    cb(null, ok);
    return;
  }

  if (!options || !options[file.fieldname] || !options[file.fieldname].accepted) {
    filter = false;
    cb(null, true);
    return;
  } if (options && typeof options[file.fieldname].accepted === 'string') {
    options[file.fieldname].accepted = [options[file.fieldname].accepted];
  }
  if (options && Array.isArray(options[file.fieldname].accepted) && filter) {
    let accepted = (options[file.fieldname].accepted || []).join('|');
    accepted = accepted.replace(/\*/g, '.*');
    accepted = accepted.replace(/\//g, '\/');
    accepted = accepted.replace('+', '\\+');
    let ok = new RegExp(accepted).test(file.mimetype);
    cb(null, ok);
    return;
  }
}

let uploadEngine = multer({ fileFilter: fileFilter, storage: storage })
export class MultipartMiddleware {
  static uploadEngine = uploadEngine;

  static parseDeco(deco: Deco, storage: 'fs' | 'gfs' = 'fs'): Array<RequestHandler> {
    if (storage !== 'fs') {
      throw new Error(`Only 'fs' storage is available at the moment`);
    }
    // find all file fields
    let fileProperties = Model.getDecoProperties(deco, ['file', 'files']);
    // return a middleware setup for uploading files from the file files
    let fieldsConfig: Array<any> = [];
    for (let prop of fileProperties) {
      let maxCount = deco.propertyTypes[prop].name === 'file' ? 1 : 12;
      if (deco.propertyTypes[prop].name === 'files' && deco.propertyTypesOptions[prop] && deco.propertyTypesOptions[prop].maxCount) {
        maxCount = deco.propertyTypesOptions[prop].maxCount;
      }
      fieldsConfig.push({name: prop, maxCount: maxCount});
      fieldsConfig.push({name: `${prop}${Settings.filePreviewSuffix}`, maxCount: 100});
    }

    return [
      MultipartMiddleware.filesOptionsInRequest(deco, fileProperties),
      MultipartMiddleware.uploadEngine.fields(fieldsConfig), 
      MultipartMiddleware.filesInBody
    ];
  }

  static filesOptionsInRequest(deco: Deco, fileProperties: Array<string>) {
    return (req: MultipartRequest, res: Response, next: NextFunction) => {
      // keep a copy of the original body to restore later
      res.locals._tmpBody = req.body;
      if (!req.filesPropertyOptions) req.filesPropertyOptions = {};
      for (let fileProp of fileProperties) {
        req.filesPropertyOptions[fileProp] = deco.propertyTypesOptions[fileProp];
      }
      next();
    };
  }

  static filesInBody(req: Request, res: Response, next: NextFunction) {
    if (!req.files) return next();
    if (!req.body) req.body = {};

    if (res.locals._tmpBody) {
      for (let key in res.locals._tmpBody) {
        req.body[key] = res.locals._tmpBody[key];
      }
    }
    delete res.locals._tmpBody;

    for (let key in req.body) {
      try {
        let testJsonParse = JSON.parse(req.body[key]);
        req.body[key] = testJsonParse;
      } catch (e) {
      }
    }

    for (let fileProp in req.files) {
      req.body[fileProp] = (req.files as any)[fileProp];
    }
    next();
  }

}