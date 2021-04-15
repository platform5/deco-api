import { Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:middleware:errors');
export class ErrorsMiddleware {

  static convertToJsonOutput(err: Error, req: Request, res: Response, next: NextFunction) {
    if (err) {
      if (res.headersSent) {
        console.log('Header sent');
        return next();
      }
      let message = err.message;
      if (message && message.substr(-1) === '.') {
        message = message.substr(0, message.length - 1);
      }
      let statusCode = res.locals.statusCode || 500;
      let jsonError = {
        error: message,
        stack: err.stack
      };
      res.status(statusCode).json(jsonError);
    }
  }

}