import { Router, Request, Response, NextFunction } from 'express';
let debug = require('debug')('app:controller:utils');

const router: Router = Router();

function status(req: Request, res: Response, next: NextFunction) {
  res.send({status: 'OK'});
}

router.get(
  '/status',
  status
);

export const UtilsController: Router = router;