"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const rotating_file_stream_1 = __importDefault(require("rotating-file-stream"));
let debug = require('debug')('deco-api:middleware:log');
class Log {
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
            fs_1.default.existsSync(Log.logFolder) || fs_1.default.mkdirSync(Log.logFolder);
            Log.accessLogStream = rotating_file_stream_1.default('access.log', {
                interval: '1d',
                path: Log.logFolder
            });
            Log.accessErrorLogStream = rotating_file_stream_1.default('access-errors.log', {
                interval: '1d',
                path: Log.logFolder
            });
            Log.errorsLogStream = rotating_file_stream_1.default('errors.log', {
                interval: '1d',
                path: Log.logFolder
            });
            Log.logInitOk = true;
        }
    }
    static logRequests() {
        Log.initLogFolderAndStreams();
        return morgan_1.default(Log.logFormat, { stream: Log.accessLogStream });
    }
    static logAccessErrors() {
        Log.initLogFolderAndStreams();
        return morgan_1.default(Log.extraErrorLogFormat, { stream: Log.accessErrorLogStream, skip: function (req, res) { return res.statusCode < 400; } });
    }
    static logDevConsole() {
        return morgan_1.default('dev', {
            skip: function (req, res) { return res.statusCode < 400; }
        });
    }
    static errorsMiddleware() {
        Log.initLogFolderAndStreams();
        return (err, req, res, next) => {
            // get filename
            let filename = '';
            if (err.stack) {
                let parts = err.stack.split(' at ');
                let keep = parts[1];
                parts = keep.split(')');
                keep = parts[0];
                filename = keep.replace(/:/g, '...');
                filename = filename.trim();
            }
            morgan_1.default(`:method :url :status ${err.message} ${filename}`, { stream: Log.errorsLogStream })(req, res, (logErr) => {
                next(err); // we cannot really send the "err" anyway, because response is already away at this point
            });
        };
    }
}
exports.Log = Log;
Log.rotateLog = true;
Log.logFolder = 'logs/';
Log.logFormat = 'common';
Log.extraErrorLog = true;
Log.extraErrorLogFormat = 'common';
Log.devLog = true;
Log.logInitOk = false;
//# sourceMappingURL=log.js.map