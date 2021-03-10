"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const test_decorators_routes_1 = require("./test.decorators.routes");
const test_policy_routes_1 = require("./test.policy.routes");
const express_1 = require("express");
const pdf_helper_1 = require("../../helpers/pdf.helper");
let debug = require('debug')('app:controller:test:decorators');
const router = express_1.Router();
router.use('/decorators', test_decorators_routes_1.TestDecoratorsController);
router.use('/policies', test_policy_routes_1.TestPolicyController);
router.use('/pdf', pdf_helper_1.PDF.testRoute());
exports.TestController = router;
//# sourceMappingURL=test.controller.js.map