"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var Operation_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operation = void 0;
const app_model_1 = require("./../app/app.model");
const __1 = require("../../");
const moment_1 = __importDefault(require("moment"));
const events_1 = __importDefault(require("events"));
let debug = require('debug')('app:models:dico');
let emmiter = new events_1.default.EventEmitter();
let Operation = Operation_1 = class Operation extends __1.Model {
    constructor() {
        super(...arguments);
        this.appId = null;
    }
    static create(appId, status, startedAt) {
        let operation = new Operation_1();
        operation.appId = appId;
        operation.status = status;
        operation.startedAt = startedAt || moment_1.default().toDate();
        return operation.insert();
    }
    static start(appId, operationId) {
        if (!operationId) {
            return Operation_1.create(appId, 'in-progress');
        }
        return Operation_1.getOneWithId(operationId).then((operation) => {
            if (!operation)
                throw new Error('Operation not found');
            operation.status = 'in-progress';
            return operation.update(['status']);
        });
    }
    static complete(operationId, message) {
        return Operation_1.getOneWithId(operationId).then((operation) => {
            if (!operation)
                throw new Error('Operation not found');
            operation.status = 'completed';
            operation.message = message || '';
            return operation.update(['status', 'message']);
        }).then((operation) => {
            emmiter.emit('completed', operation);
            return operation;
        });
    }
    static errored(operationId, message) {
        return Operation_1.getOneWithId(operationId).then((operation) => {
            if (!operation)
                throw new Error('Operation not found');
            operation.status = 'errored';
            operation.message = message || '';
            return operation.update(['status', 'message']);
        }).then((operation) => {
            emmiter.emit('completed', operation);
            return operation;
        });
    }
    static startMiddelware(req, res, next) {
        if (!res.locals.app) {
            next(new Error('Missing app'));
            return;
        }
        const app = res.locals.app;
        const rightInstance = app instanceof app_model_1.AppModel;
        if (!rightInstance) {
            next(new Error('Invalid app'));
            return;
        }
        Operation_1.start(app._id).then((operation) => {
            res.locals.currentOperation = operation;
            next();
        }).catch(next);
    }
    static completeCurrentOperation(res, status, message) {
        if (!res.locals.currentOperation) {
            throw new Error('No currentOperation found');
        }
        const operation = res.locals.currentOperation;
        const rightInstance = operation instanceof Operation_1;
        if (!rightInstance) {
            throw new Error('Invalid currentOperation');
        }
        if (status === 'completed') {
            return Operation_1.complete(operation._id, message);
        }
        else {
            return Operation_1.errored(operation._id, message);
        }
    }
    static sendCurrentOperation(req, res, next) {
        if (!res.locals.currentOperation) {
            next(new Error('No currentOperation found'));
            return;
        }
        const operation = res.locals.currentOperation;
        const rightInstance = res.locals.currentOperation instanceof Operation_1;
        if (!rightInstance) {
            next(new Error('Invalid currentOperation'));
            return;
        }
        operation.output().then((element) => {
            res.send(element);
        }).catch(next);
    }
    static waitForCompletion(req, res, next) {
        const operationId = req.params.operationId;
        if (!operationId) {
            next(new Error('Missing operationId'));
            return;
        }
        let sent = false;
        const send = (operation) => {
            if (sent)
                return;
            sent = true;
            if (operation instanceof Operation_1) {
                operation.output().then((element) => {
                    res.send(element);
                });
            }
            else {
                next(new Error('Invalid operation completion'));
            }
        };
        Operation_1.getOneWithId(operationId).then((operation) => {
            if (!operation)
                throw new Error('Operation not found');
            if (operation.status === 'completed' || operation.status === 'errored') {
                send(operation);
            }
            else {
                let sent = false;
                emmiter.once('completed', (operation) => {
                    if (!sent) {
                        send(operation);
                        sent = true;
                    }
                });
                setTimeout(() => {
                    Operation_1.getOneWithId(operationId).then((operation) => {
                        if (!sent && operation) {
                            send(operation);
                            sent = true;
                        }
                    });
                }, 20000);
            }
        }).catch(next);
    }
};
__decorate([
    __1.type.model({ model: app_model_1.AppModel }),
    __1.io.toDocument,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required,
    __1.mongo.index({ type: 'single' })
], Operation.prototype, "appId", void 0);
__decorate([
    __1.type.select({ options: ['pending', 'in-progress', 'completed', 'errored'] }),
    __1.io.toDocument,
    __1.io.output,
    __1.query.filterable({ type: 'auto' }),
    __1.validate.required
], Operation.prototype, "status", void 0);
__decorate([
    __1.type.string,
    __1.io.toDocument,
    __1.io.output
], Operation.prototype, "message", void 0);
__decorate([
    __1.type.date,
    __1.io.toDocument,
    __1.io.output
], Operation.prototype, "startedAt", void 0);
__decorate([
    __1.type.integer,
    __1.io.toDocument,
    __1.io.output
], Operation.prototype, "duration", void 0);
Operation = Operation_1 = __decorate([
    __1.model('operation')
], Operation);
exports.Operation = Operation;
//# sourceMappingURL=operation.model.js.map