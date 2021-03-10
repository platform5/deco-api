"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let debug = require('debug')('app:middleware:errors');
class ErrorsMiddleware {
    static convertToJsonOutput(err, req, res, next) {
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
exports.ErrorsMiddleware = ErrorsMiddleware;
//# sourceMappingURL=errors.middleware.js.map