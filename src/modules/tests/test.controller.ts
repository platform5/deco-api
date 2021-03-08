import { TestDecoratorsController } from './test.decorators.routes';
import { TestPolicyController } from './test.policy.routes';
import { Router } from 'express';
import { PDF } from '../../helpers/pdf.helper';
let debug = require('debug')('app:controller:test:decorators');

const router: Router = Router();

router.use('/decorators', TestDecoratorsController);
router.use('/policies', TestPolicyController);
router.use('/pdf', PDF.testRoute())

export const TestController: Router = router;