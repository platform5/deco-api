"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const push_player_model_1 = require("./push.player.model");
const controller_1 = require("./../../middlewares/controller");
const __1 = require("../../");
const moment_1 = __importDefault(require("moment"));
let debug = require('debug')('app:middleware:controllers:dico');
class PushControllerMiddleware extends controller_1.ControllerMiddleware {
    extendGetAllQuery(query, req, res) {
        if (req.params.appId) {
            try {
                let appId = new __1.ObjectId(req.params.appId);
                query.addQuery({ appId: appId });
            }
            catch (error) {
                throw new Error('Invalid req.params.appId');
            }
        }
        else if (res.locals.app) {
            query.addQuery({ appId: res.locals.app._id });
        }
        else {
            throw new Error('No app in params or fetched by api key');
        }
        return Promise.resolve();
    }
    registerPlayer() {
        return (req, res, next) => {
            if (!res.locals.app)
                return next(new Error('Missing app'));
            if (!req.body.regId)
                return next(new Error('Missing regId'));
            if (!req.body.uuid)
                return next(new Error('Missing uuid'));
            if (!req.body.type || (req.body.type !== 'fcm' && req.body.type !== 'apn'))
                return next(new Error('Missing or invalid type, must be apn or fcm'));
            let players = [];
            let playerQuery = { $or: [
                    { regId: req.body.regId },
                    { uuid: req.body.uuid },
                ] };
            if (res.locals.user) {
                playerQuery.$or.push({ userId: res.locals.user._id });
            }
            let query = new __1.Query(playerQuery);
            query.addQuery({ appId: res.locals.app._id });
            query.addQuery({ active: true });
            push_player_model_1.PushPlayerModel.getAll(query).then((p) => {
                players = p;
                if (!players || players.length === 0) {
                    // create the player
                    let player = new push_player_model_1.PushPlayerModel;
                    player.appId = res.locals.app._id;
                    player.regId = req.body.regId;
                    player.uuid = req.body.uuid;
                    player.type = req.body.type;
                    player.active = true;
                    player.lastVisit = moment_1.default().toDate();
                    if (res.locals.user) {
                        player.userId = res.locals.user._id;
                    }
                    return player.insert();
                }
                let finalPlayer = players[0];
                let updatePromises = [];
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
                finalPlayer.lastVisit = moment_1.default().toDate();
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
    extendRequest(req, control) {
        if (req.params.regId && (control === 'put' || control === 'getOne')) {
            return push_player_model_1.PushPlayerModel.getOneWithQuery({ regId: req.params.regId }).then((player) => {
                if (!player)
                    throw new Error('Player not found');
                req.params.elementId = player._id.toString();
            });
        }
        return Promise.resolve();
    }
    sendTags(req, res, next) {
        let tags = res.locals.element.tags || [];
        res.send(tags);
    }
    setVisitInBody(req, res, next) {
        req.body.lastVisit = moment_1.default().format('DD-MM-YYYY');
        next();
    }
    getNbPlayers(req, res, next) {
        let appId;
        try {
            appId = new __1.ObjectId(req.body.appId);
        }
        catch (error) {
            return next(new Error('Invalid appId'));
        }
        push_player_model_1.PushPlayerModel.nbPlayers(appId).then((nbPlayers) => {
            res.locals.nbPlayers = nbPlayers;
            next();
        }).catch(next);
    }
    getPlayerTags(req, res, next) {
        let appId;
        try {
            appId = new __1.ObjectId(req.body.appId);
        }
        catch (error) {
            return next(new Error('Invalid appId'));
        }
        push_player_model_1.PushPlayerModel.tags(appId).then((tags) => {
            res.locals.tags = tags;
            next();
        }).catch(next);
    }
}
exports.PushControllerMiddleware = PushControllerMiddleware;
//# sourceMappingURL=push.middleware.controller.js.map