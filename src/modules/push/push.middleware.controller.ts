import { PushPlayerModel } from './push.player.model';
import { ControllerMiddleware } from './../../middlewares/controller';
import { Request, Response, NextFunction } from 'express';
import { Query, ObjectId } from '../../';
import moment from 'moment';

let debug = require('debug')('app:middleware:controllers:dico');

export class PushControllerMiddleware extends ControllerMiddleware {

  extendGetAllQuery(query: Query, req: Request, res: Response): Promise<void> {
    if (req.params.appId) {
      try {
        let appId = new ObjectId(req.params.appId);
        query.addQuery({appId: appId});
      } catch (error) {
        throw new Error('Invalid req.params.appId');
      }
    } else if (res.locals.app) {
      query.addQuery({appId: res.locals.app._id});
    } else {
      throw new Error('No app in params or fetched by api key');
    }
    return Promise.resolve();
  }

  registerPlayer() {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!res.locals.app) return next(new Error('Missing app'));
      if (!req.body.regId) return next(new Error('Missing regId'));
      if (!req.body.uuid) return next(new Error('Missing uuid'));
      if (!req.body.type || (req.body.type !== 'fcm' && req.body.type !== 'apn')) return next(new Error('Missing or invalid type, must be apn or fcm'));
      
      let players: Array<PushPlayerModel> = [];

      let playerQuery: any = {$or: [
        {regId: req.body.regId},
        {uuid: req.body.uuid},
      ]};

      if (res.locals.user) {
        playerQuery.$or.push({userId: res.locals.user._id});
      }

      let query = new Query(playerQuery);
      query.addQuery({appId: res.locals.app._id});
      query.addQuery({active: true});


      PushPlayerModel.getAll(query).then((p) => {
        players = p;
        if (!players || players.length === 0) {
          // create the player
          let player = new PushPlayerModel;
          player.appId = res.locals.app._id;
          player.regId = req.body.regId;
          player.uuid = req.body.uuid;
          player.type = req.body.type;
          player.active = true;
          player.lastVisit = moment().toDate();
          if (res.locals.user) {
            player.userId = res.locals.user._id;
          }
          return player.insert();
        }
        let finalPlayer: PushPlayerModel = players[0];
        let updatePromises: Array<Promise<any>> = [];
        if (players.length > 0) {
          let keptOne = false;
          let index = 0;
          for (let player of players) {
            if (res.locals.user && player.userId && res.locals.user._id.toString() === player.userId.toString()) {
              finalPlayer = player;
              keptOne = true;
              continue;
            }
            if (!res.locals.user && index === 0) {
              finalPlayer = player;
              keptOne = true;
              continue;
            }
            player.active = false;
          }
          if (!keptOne) {
            players[0].active = true;
          }
        }
        finalPlayer.regId = req.body.regId;
        finalPlayer.uuid = req.body.uuid;
        finalPlayer.type = req.body.type;
        finalPlayer.active = true;
        finalPlayer.lastVisit = moment().toDate();
        if (res.locals.user) {
          finalPlayer.userId = res.locals.user._id;
        }

        for (let player of players) {
          updatePromises.push(player.update());
        }
        return Promise.all(updatePromises);
      }).then(() => {
        res.sendStatus(204);
      }).catch(next);
    };
  }

  extendRequest(req: Request, control: 'getAll' | 'getOne' | 'post' | 'put' | 'delete'): Promise<void> {
    if (req.params.regId && (control === 'put' || control === 'getOne')) {
      return PushPlayerModel.getOneWithQuery({regId: req.params.regId}).then((player) => {
        if (!player) throw new Error('Player not found');
        req.params.elementId = player._id.toString();
      });
    }
    return Promise.resolve();
  }

  sendTags(req: Request, res: Response, next: NextFunction) {
    let tags = res.locals.element.tags || [];
    res.send(tags);
  }

  setVisitInBody(req: Request, res: Response, next: NextFunction) {
    req.body.lastVisit = moment().format('DD-MM-YYYY');
    next()
  }

  getNbPlayers(req: Request, res: Response, next: NextFunction) {
    let appId: ObjectId;
    try {
      appId = new ObjectId(req.body.appId);
    } catch (error) {
      return next(new Error('Invalid appId'));
    }
    PushPlayerModel.nbPlayers(appId).then((nbPlayers) => {
      res.locals.nbPlayers = nbPlayers;
      next();
    }).catch(next);
  }

  getPlayerTags(req: Request, res: Response, next: NextFunction) {
    let appId: ObjectId;
    try {
      appId = new ObjectId(req.body.appId);
    } catch (error) {
      return next(new Error('Invalid appId'));
    }
    PushPlayerModel.tags(appId).then((tags) => {
      res.locals.tags = tags;
      next();
    }).catch(next);
  }
}