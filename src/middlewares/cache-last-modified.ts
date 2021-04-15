import { Request, Response, NextFunction } from 'express';
import moment from 'moment';

export class CacheLastModified {
  static init() {
    return (req: Request, res: Response, next: NextFunction) => {
      const lastModifiedRequest = req.header('If-Modified-Since') || '';
      CacheLastModified.registerCacheLastModified(res, lastModifiedRequest);
      next();
    };
  }

  static send(prop: 'auto' | 'element' | 'elements' | string = 'auto', source: 'locals' = 'locals') {
    return (req: Request, res: Response, next: NextFunction) => {
      let lastModifiedResponse = '';
      if (!res.locals.cacheLastModified) {
        return next('Missing cacheLastModified');
      }
      const lastModifiedRequest = res.locals.cacheLastModified.lastModified || '';
      let data: any | any[];
      if (source === 'locals') {
        if (prop === 'auto') {
          data = res.locals.elements || res.locals.element;
        } else {
          data = res.locals[prop];
        }
      }
      if (!data) {
        return next(new Error('Data not found'));
      }
      if (!Array.isArray(data)) {
        data = [data];
      }
      const DATE_RFC2822 = "ddd, DD MMM YYYY HH:mm:ss ZZ";
      let lastUpdatedMoment = moment().subtract(50, 'years');
      for (let element of data) {
        const updatedAt = element._updatedAt;
        if (!updatedAt) {
          continue;
        }
        const elementMoment = moment(updatedAt);
        if (elementMoment.isAfter(lastUpdatedMoment)) {
          lastUpdatedMoment = elementMoment;
          lastModifiedResponse = elementMoment.lang('en').format(DATE_RFC2822);
        }
      }
      if (lastModifiedResponse && lastModifiedResponse === lastModifiedRequest) {
        res.setHeader('Cache-Control', 'private, must-revalidate');
        res.sendStatus(304);
      } else {
        res.setHeader('Cache-Control', 'private, must-revalidate');
        res.setHeader('Last-Modified', lastModifiedResponse);
        res.send(data);
      }
    };
  }

  private static registerCacheLastModified(res: Response, lastModified: string) {
    if (!res.locals.cacheLastModified) {
      res.locals.cacheLastModified = {};
    }
    res.locals.cacheLastModified.lastModified = lastModified;

  }

}