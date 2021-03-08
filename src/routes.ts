import { PushController } from './modules/push/push.controller';
import { ProfileController } from './modules/user/profile.controller';
import { UtilsController } from './modules/utils/utils.controller';
import { DynamicConfigController } from './modules/dynamic/dynamicconfig.controller';
import { DynamicDataController } from './modules/dynamic/dynamicdata.controller';
import { TemplateController } from './modules/template/template.controller';
import { DicoController } from './modules/dico/dico.controller';
import { AuthController } from './modules/user/auth.controller';
import { UserController } from './modules/user/user.controller';
import { AppController } from './modules/app/app.controller';
import { TestController } from './modules/tests/test.controller';
import { Router } from 'express';

const router: Router = Router();
router.use('/', UserController);
router.use('/', UtilsController);
router.use('/app', AppController);
router.use('/auth', AuthController);
router.use('/dico', DicoController);
router.use('/template', TemplateController);
router.use('/dynamicdata', DynamicDataController);
router.use('/dynamicconfig', DynamicConfigController);
router.use('/test', TestController);
router.use('/profile', ProfileController);
router.use('/push', PushController);

export { router as DecoRoutes};