"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UtilsController = void 0;
const express_1 = require("express");
let debug = require('debug')('app:controller:utils');
const router = express_1.Router();
function status(req, res, next) {
    res.send({ status: 'OK' });
}
router.get('/status', status);
exports.UtilsController = router;
//# sourceMappingURL=utils.controller.js.map