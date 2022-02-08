import { Request, Response } from 'express';
let debug = require('debug')('deco-api:helpers:settings');

export class Settings {
  static defaultDateFormat: string = 'DD-MM-YYYY';
  static filePreviewSuffix: string = '_preview';
  static fileRemoveSuffix: string = '_remove';
  static fileSortSuffix: string = '_sort';
  static fileClearSuffix: string = '_clear';
  static defaultLocale: string = 'fr';
  static cryptoKey: string = 'hewAdviwud52%289ynvsodaDahfbpwitd';

  static locale(req?: Request, options?: any) {
    if (req && req.query && req.query.locale) return req.query.locale;
    if (options && options.defaultLocale) return options.defaultLocale;
    return Settings.defaultLocale;
  }
}