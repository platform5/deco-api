import { AppModel } from './../app/app.model';
import { model, Model, type, io, validate, ObjectId } from '../../';
import crypto from 'crypto';
import moment from 'moment';
let debug = require('debug')('app:models:validation-tokens');

@model('validationTokens')
export class ValidationTokenModel extends Model {

  @type.model({model: AppModel})
  @io.toDocument
  @validate.required
  public appId: ObjectId | null = null;

  @type.string
  @io.toDocument
  @validate.required
  public type: string = '';

  @type.string
  @io.toDocument
  @io.output
  @validate.required
  public token: string = '';

  @type.string
  @io.toDocument
  @validate.required
  public emailCode: string = '';

  @type.string
  @io.toDocument
  @validate.required
  public mobileCode: string = '';

  @type.boolean
  @io.toDocument
  @io.output
  @validate.required
  public emailValidated: boolean = false;

  @type.boolean
  @io.toDocument
  @io.output
  @validate.required
  public mobileValidated: boolean = false;

  @type.date
  @io.toDocument
  @io.output
  @validate.required
  public expires: Date = new Date();

  @type.any
  @io.toDocument
  public data: null;

  @type.any
  @io.toDocument
  public extraData: null;

  @type.boolean
  @io.toDocument
  public userCreated: boolean = false;

  @type.any
  @io.toDocument
  public logs: Array<any> = [];

  constructor() {
    super();
    this.model = ValidationTokenModel;
  }

  init(type: string, validity: number = 48, validityUnit: 'hours' | 'minutes' | 'days' | 'weeks' = 'hours') {
    //super();
    this.type = type;
    let len = 32;
    this.token = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    len = 6;
    this.emailCode = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    this.mobileCode = crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
    this.expires = moment().add(validity, validityUnit).toDate();
  }
}