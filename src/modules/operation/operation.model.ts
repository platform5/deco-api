import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId, mongo } from '../../';
import { Request, Response, NextFunction } from 'express';
import moment from 'moment';
import events from 'events';
let debug = require('debug')('app:models:dico');
let emmiter = new events.EventEmitter();

type Status = 'pending' | 'in-progress' | 'completed' | 'errored';

@model('operation')
export class Operation extends Model {
  @type.model({model: AppModel})
  @io.toDocument
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId | null = null;

  @type.select({options: ['pending', 'in-progress', 'completed', 'errored']})
  @io.toDocument
  @io.output
  @query.filterable({type: 'auto'})
  @validate.required
  public status: Status;

  @type.string
  @io.toDocument
  @io.output
  public message: string;

  @type.date
  @io.toDocument
  @io.output
  public startedAt: Date;

  @type.integer
  @io.toDocument
  @io.output
  public duration: number;

  static create(appId: ObjectId, status: Status, startedAt?: Date): Promise<Operation> {
    let operation = new Operation();
    operation.appId = appId;
    operation.status = status;
    operation.startedAt = startedAt || moment().toDate();
    return operation.insert();
  }

  static start(appId: ObjectId, operationId?: string | ObjectId): Promise<Operation> {
    if (!operationId) {
      return Operation.create(appId, 'in-progress');
    }
    return Operation.getOneWithId(operationId).then((operation) => {
      if (!operation) throw new Error('Operation not found');
      operation.status = 'in-progress';
      return operation.update(['status']);
    });
  }

  static complete(operationId: string | ObjectId, message?: string): Promise<Operation> {
    return Operation.getOneWithId(operationId).then((operation) => {
      if (!operation) throw new Error('Operation not found');
      operation.status = 'completed';
      operation.message = message || '';
      return operation.update(['status', 'message']);
    }).then((operation) => {
      emmiter.emit('completed', operation);
      return operation;
    });
  }

  static errored(operationId: string | ObjectId, message?: string): Promise<Operation> {
    return Operation.getOneWithId(operationId).then((operation) => {
      if (!operation) throw new Error('Operation not found');
      operation.status = 'errored';
      operation.message = message || '';
      return operation.update(['status', 'message']);
    }).then((operation) => {
      emmiter.emit('completed', operation);
      return operation;
    });
  }

  static startMiddelware(req: Request, res: Response, next: NextFunction) {
    if (!res.locals.app) {
      next(new Error('Missing app'));
      return;
    }
    const app = res.locals.app as AppModel;
    const rightInstance = app instanceof AppModel;
    if (!rightInstance) {
      next(new Error('Invalid app'));
      return;
    }
    Operation.start(app._id).then((operation) => {
      res.locals.currentOperation = operation;
      next();
    }).catch(next);
  }

  static completeCurrentOperation(res: Response, status: 'completed' | 'errored', message?: string): Promise<Operation> {
    if (!res.locals.currentOperation) {
      throw new Error('No currentOperation found');
    }
    const operation = res.locals.currentOperation as Operation;
    const rightInstance = operation instanceof Operation;
    if (!rightInstance) {
      throw new Error('Invalid currentOperation');
    }
    if (status === 'completed') {
      return Operation.complete(operation._id, message);
    } else {
      return Operation.errored(operation._id, message);
    }
  }

  static sendCurrentOperation(req: Request, res: Response, next: NextFunction) {
    if (!res.locals.currentOperation) {
      next(new Error('No currentOperation found'));
      return;
    }
    const operation = res.locals.currentOperation as Operation;
    const rightInstance = res.locals.currentOperation instanceof Operation;
    if (!rightInstance) {
      next(new Error('Invalid currentOperation'));
      return;
    }
    operation.output().then((element) => {
      res.send(element);
    }).catch(next);
  }

  static waitForCompletion(req: Request, res: Response, next: NextFunction) {
    const operationId = req.params.operationId;
    if (!operationId) {
      next(new Error('Missing operationId'));
      return;
    }
    let sent = false;
    const send = (operation: Operation) => {
      if (sent) return;
      sent = true;
      if (operation instanceof Operation) {
        operation.output().then((element) => {
          res.send(element);
        });
      } else {
        next(new Error('Invalid operation completion'));
      }
    }
    Operation.getOneWithId(operationId).then((operation) => {
      if (!operation) throw new Error('Operation not found');
      if (operation.status === 'completed' || operation.status === 'errored') {
        send(operation);
      } else {
        let sent = false;
        emmiter.once('completed', (operation: Operation) => {
          if (!sent) {
            send(operation);
            sent = true;
          }
        });
        setTimeout(() => {
          Operation.getOneWithId(operationId).then((operation) => {
            if (!sent && operation) {
              send(operation);
              sent = true;
            }
          });
        }, 20000);
      }
    }).catch(next);
  }
}