import { RequestHandler, Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import fs from 'fs';
import rfs from 'rotating-file-stream';
let debug = require('debug')('deco-api:middleware:log');

export class Log {
  static rotateLog: boolean = true;
  static logFolder: string = 'logs/';
  static logFormat: string = 'common';
  static extraErrorLog: boolean = true;
  static extraErrorLogFormat: string = 'common';
  static devLog: boolean = true;

  private static logInitOk: boolean = false;
  private static accessLogStream: any;
  private static accessErrorLogStream: any;
  private static errorsLogStream: any;

  static accessMiddleware() {
    let md = [Log.logRequests()];
    if (Log.extraErrorLog) {
      md.push(Log.logAccessErrors());
    }
    if (Log.devLog) {
      md.push(Log.logDevConsole());
    }
    return md;
  }

  static initLogFolderAndStreams() {
    if (!Log.logInitOk) {
      fs.existsSync(Log.logFolder) || fs.mkdirSync(Log.logFolder);
      Log.accessLogStream = rfs('access.log', {
        interval: '1d', // rotate daily
        path: Log.logFolder
      });
      Log.accessErrorLogStream = rfs('access-errors.log', {
        interval: '1d', // rotate daily
        path: Log.logFolder
      });
      Log.errorsLogStream = rfs('errors.log', {
        interval: '1d', // rotate daily
        path: Log.logFolder
      });
      Log.logInitOk = true;
    }
  }

  static logRequests(): RequestHandler {
    Log.initLogFolderAndStreams();
    return morgan(Log.logFormat, {stream: Log.accessLogStream});
  }

  static logAccessErrors(): RequestHandler {
    Log.initLogFolderAndStreams();
    return morgan(Log.extraErrorLogFormat, {stream: Log.accessErrorLogStream, skip: function (req, res) { return res.statusCode < 400 }});
  }

  static logDevConsole(): RequestHandler {
    return morgan('dev', {
      skip: function (req, res) { return res.statusCode < 400 }
    });
  }

  static errorsMiddleware() {
    Log.initLogFolderAndStreams();

    return (err: Error, req: Request, res: Response, next: NextFunction) => {
      // get filename
      let filename: string = '';
      if (err.stack) {
        let parts = err.stack.split(' at ');
        let keep = parts[1];
        parts = keep.split(')');
        keep = parts[0];
        filename = keep.replace(/:/g, '...');
        filename = filename.trim();
      }

      morgan(`:method :url :status ${err.message} ${filename}`, {stream: Log.errorsLogStream})(req, res, (logErr: string) => {
        next(err); // we cannot really send the "err" anyway, because response is already away at this point
      });
    }
  }

}