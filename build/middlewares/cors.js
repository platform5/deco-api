"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CorsMiddleware {
    static allowEverything() {
        return (req, res, next) => {
            let allowHeaders = req.get('Access-Control-Request-Headers') || 'content-type, authorization, Cache-Control, X-Requested-With';
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', allowHeaders);
            res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,HEAD,PATCH,GET,POST,PUT,DELETE');
            res.setHeader('Access-Control-Allow-Credentials', 'true');
            /*
                  "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "content-type, authorization, Cache-Control, X-Requested-With, preview-control",
                    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
                    "Access-Control-Allow-Credentials": "true"
                    */
            if (req.method === 'OPTIONS')
                return res.send();
            next();
        };
    }
}
exports.CorsMiddleware = CorsMiddleware;
//# sourceMappingURL=cors.js.map