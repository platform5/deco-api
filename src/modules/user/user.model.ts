import { AppModel } from './../app/app.model';
import { Policies, model, Model, type, io, query, validate, ObjectId, Settings, Query, UpdateQuery, mongo } from '../../';
import crypto from 'crypto';
import moment from 'moment';
import bcrypt from 'bcrypt';
const hmacsha1 = require('crypto-js/hmac-sha1');
// import hmacsha1 from 'crypto-js/hmac-sha1';
let debug = require('debug')('app:models:user');

@Policies.modelPolicy('getAll', {public: false, userIdByProperty: '_createdBy'})
@Policies.modelPolicy('getOne', {public: false, userIdByProperty: '_createdBy'})
@Policies.modelPolicy('put', {public: false, userIdByProperty: '_createdBy'})
@model('users')
export class UserModel extends Model {

  @type.model({model: AppModel})
  @io.all
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId | null = null;

  @type.string
  @io.all
  @validate.required
  @query.searchable
  @query.all
  public firstname: string = '';

  @type.string
  @io.all
  @validate.required
  @query.searchable
  @query.all
  public lastname: string = '';

  @type.string
  @io.all
  @validate.email
  @query.searchable
  @query.all
  @validate.uniqueByApp
  @mongo.index({type: 'single'})
  public email: string = '';

  @type.boolean
  @io.toDocument
  @io.output
  @validate.required
  public emailValidated: boolean = false;

  @type.string
  @io.all
  @query.all
  @query.searchable
  @validate.uniqueByApp
  @mongo.index({type: 'single'})
  public mobile: string = '';

  @type.boolean
  @io.toDocument
  @io.output
  @validate.required
  public mobileValidated: boolean = false;

  @type.string
  @io.toDocument
  @validate.required
  @query.all
  @mongo.index({type: 'single'})
  public hash: string = '';

  @type.date
  @io.toDocument
  @validate.required
  public hashUpdateDate: Date = new Date();

  @type.boolean
  @io.all
  requireDoubleAuth: boolean = false;

  @type.string
  @io.all
  public locale: string;

  @type.array({type: 'string'})
  @io.input
  @io.output
  @io.toDocument
  roles: Array<string> = [];

  @type.boolean
  @io.output
  @io.toDocument
  hideOnboarding: boolean = false;

  static hashFromPassword(password: string) {
    return crypto.createHmac('sha1', Settings.cryptoKey).update(password).digest('hex');
  }

  static mint2HashFromPassword(password: string) {
    let hash = bcrypt.hashSync(password, 8);
    return hash;
  }

  generateHash(password: string) {
    this.hash = UserModel.hashFromPassword(password);
    this.hashUpdateDate = moment().toDate();
  }

  toDocument(operation: 'insert' | 'update' | 'upsert', properties: Array<string> = []): Promise<UpdateQuery> {
    if (this.email) this.email = this.email.toLowerCase();
    return super.toDocument(operation, properties)
  }

  static authUser(appId: ObjectId, username: string, password: string): Promise<UserModel | false> {
    let query = new Query({appId: appId});
    username = username.toLowerCase().trim();
    query.addQuery({$or: [
      {email: username},
      {mobile: username}
    ]});

    query.addQuery({hash: UserModel.hashFromPassword(password.trim())});

    return UserModel.getOneWithQuery(query.onlyQuery()).then((user) => {
      if (!user) return UserModel.checkMintello2User(username, password.trim());
      return user;
    });
  }

  static checkMintello2User(username: string, password: string): Promise<UserModel | false> {
    let query = new Query({email: username});
    let user: UserModel;
    return UserModel.getOneWithQuery(query.onlyQuery()).then((u): boolean => {
      if (!u) return false;
      user = u;
      if(user.hash.length === '966cfa2aa7626f872c6f985a3a73fa464d3088f8'.length) {
        // check login using MD5 system (Mintello 1)
        if(hmacsha1(password, 'd8c9a9245fd928afde5cb2b53e8882bba3f9e273').toString() === user.hash) return true;
        return false;
      } else {
        // check login using the bcrypt system (Mintello 2)
        return bcrypt.compareSync(password, user.hash);
      }
    }).then((valid) => {
      if (valid) return user;
      return false;
    });
  }
}

// the following lines fixes the AppModel config of the appId property of the UserModel.
// this is necessary because there is a circular reference between AppModel and UserModel
// and the decorating concept fails to link the two correctly
setTimeout(() => {
  UserModel.deco.propertyTypesOptions.appId.model = AppModel;
}, 1000);