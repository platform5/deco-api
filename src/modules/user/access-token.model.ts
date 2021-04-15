import { UserModel } from './user.model';
import { AppModel } from './../app/app.model';
import { model, Model, type, io, validate, ObjectId } from '../../';
import crypto from 'crypto';
import moment from 'moment';
let debug = require('debug')('app:models:access-tokens');

@model('accessTokens')
export class AccessTokenModel extends Model {

  @type.model({model: AppModel})
  @io.toDocument
  @validate.required
  public appId: ObjectId | null = null;

  @type.select({options: ['access', 'double-auth']})
  @io.toDocument
  @io.output
  @validate.required
  public type: string = 'access';

  @type.string
  @io.toDocument
  @io.output
  @validate.required
  public token: string = '';

  @type.string
  @io.toDocument
  @io.output
  public refresh?: string = '';

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

  constructor() {
    super();
    this.model = AccessTokenModel;
  }

  init(type: 'access' | 'double-auth', userId: ObjectId, appId: ObjectId,  validity: number = 2, validityUnit: 'hours' | 'minutes' | 'days' | 'weeks' = 'weeks') {
    //super();
    this.type = type;
    this.userId = userId;
    this.appId = appId;
    let len = 32;
    this.token = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    if (this.type === 'access') this.refresh = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    if (this.type === 'double-auth') this.code = crypto.randomBytes(Math.ceil(6 / 2)).toString('hex').slice(0, 6);
    this.expires = moment().add(validity, validityUnit).toDate();
  }

  output(): Promise<any> {
    let validity = moment(this.expires).diff(moment(), 'seconds');
    return super.output().then((element: any) => {
      element.validity = validity;
      return element;
    });
  }
}