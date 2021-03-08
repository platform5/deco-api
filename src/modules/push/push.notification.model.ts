import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId, mongo } from '../../';
let debug = require('debug')('app:models:dico');

@model('pushnotification')
export class PushNotificationModel extends Model {

  @type.model({model: AppModel})
  @io.all
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId;

  @type.array({type: 'string'})
  @io.toDocument
  public sentToRegIds: Array<string> = [];

  @type.array({type: 'string'})
  @io.toDocument
  public viewedByRegIds: Array<string> = [];

  @type.array({type: 'string'})
  @io.toDocument
  public openedByRegIds: Array<string> = [];

  @type.string
  @io.all
  public title: string;

  @type.string
  @io.all
  public message: string;

  @type.string
  @io.all
  public collapseKey: string;

  @type.boolean
  @io.all
  public contentAvailable: false;

  @type.integer
  @io.all
  public badge: false;

  @type.string
  @io.all
  public custom: string;

  @type.date
  @io.all
  public sendAt: Date;

  @type.array({type: 'string'})
  @io.all
  public sendToTags: Array<string> = [];

  @type.boolean
  @io.toDocument
  public sent: boolean = false;

  @type.date
  @io.toDocument
  @io.output
  public sentAt: Date;

  output(includeProps?: Array<string>): Promise<any> {

    let nbSent = this.sentToRegIds.length || 0;
    let nbViewed = this.viewedByRegIds.length || 0;
    let nbOpened = this.openedByRegIds.length || 0;

    return super.output(includeProps).then((data) => {
      data.nbSent = nbSent;
      data.nbViewed = nbViewed;
      data.nbOpened = nbOpened;
      return data;
    });
  }
  
}