import { UserModel } from './user.model';
import { AppModel } from './../app/app.model';
import { model, Model, type, io, validate, ObjectId } from '../../';
import crypto from 'crypto';
import moment from 'moment';
let debug = require('debug')('app:models:reset-password-token');

@model('changeemailormobiletoken')
export class ChangeEmailOrMobileTokenModel extends Model {

  @type.model({model: AppModel})
  @io.toDocument
  @validate.required
  public appId: ObjectId | null = null;

  @type.string
  @io.toDocument
  @io.output
  @validate.required
  public token: string = '';

  @type.string
  @io.toDocument
  public code: string = '';

  @type.date({dateFormat: 'YYYY-MM-DDTHH:mm:ss[Z]'})
  @io.toDocument
  @io.output
  @validate.required
  public expires: Date = new Date();

  @type.model({model: UserModel})
  @io.toDocument
  @validate.required
  public userId: ObjectId | null = null;

  @type.select({options: ['email', 'mobile']})
  @io.toDocument
  @validate.required
  public type: 'email' | 'mobile';

  @type.string
  @io.toDocument
  @validate.email
  public newEmail: string;

  @type.string
  @io.toDocument
  public newMobile: string;

  @type.boolean
  @io.toDocument
  public used: boolean = false;

  constructor() {
    super();
    this.model = ChangeEmailOrMobileTokenModel;
  }

  init(userId: ObjectId, appId: ObjectId, validity: number = 1, validityUnit: 'hours' | 'minutes' | 'days' | 'weeks' = 'hours') {
    //super();
    this.userId = userId;
    this.appId = appId;
    let len = 32;
    this.token = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    len = 6;
    this.code = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    this.expires = moment().add(validity, validityUnit).toDate();
  }

  set(type: 'email' | 'mobile', value: string) {
    this.type = type;
    if (this.type === 'email') {
      this.newEmail = value;
    } else if (this.type === 'mobile') {
      this.newMobile = value;
    }
  }
}