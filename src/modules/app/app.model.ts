import { model, Model, type, io, query, validate, ObjectId, UpdateQuery, mongo, UserModel } from '../../';
import crypto from 'crypto';
let debug = require('debug')('app:models:app');

export interface ApiKey {
  key: string;
  name: string;
  expires?: Date;
  active?: boolean;
};

export interface AppUserItem {
  _id: ObjectId;
  roles: Array<string>;
}

@model('apps')
export class AppModel extends Model {

  @type.model({model: AppModel})
  @io.input
  @io.toDocument
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId | null = null;

  @type.string
  @io.all
  @validate.required
  name: string = '';

  @type.string({textarea: true})
  @io.all
  description: string = '';

  @type.file({accepted: ['image/*', 'application/pdf']})
  @io.all
  public image: any = null;

  @type.string
  @io.all
  primaryColor: string = '';

  @type.string
  @io.all
  primaryForegroundColor: string = '';

  @type.string
  @io.all
  primaryLightColor: string = '';

  @type.string
  @io.all
  primaryLightForegroundColor: string = '';

  @type.string
  @io.all
  primaryDarkColor: string = '';

  @type.string
  @io.all
  primaryDarkForegroundColor: string = '';

  @type.string
  @io.all
  accentColor: string = '';

  @type.string
  @io.all
  accentForegroundColor: string = '';

  @type.string
  @io.all
  accentLightColor: string = '';

  @type.string
  @io.all
  accentLightForegroundColor: string = '';

  @type.string
  @io.all
  accentDarkColor: string = '';

  @type.string
  @io.all
  accentDarkForegroundColor: string = '';

  @io.toDocument
  @type.array({type: 'object', objectOptions: {
    keys: {
      key: {type: 'string', required: true},
      name: {type: 'string', required: true},
      expires: {type: 'date', dateFormat: 'DD-MM-YYYY'},
      active: {type: 'boolean'}
    }
  }})
  publicKeys: Array<ApiKey> = [];

  @io.toDocument
  @type.array({type: 'object', objectOptions: {
    keys: {
      key: {type: 'string', required: true},
      name: {type: 'string', required: true},
      expires: {type: 'date', dateFormat: 'DD-MM-YYYY'},
      active: {type: 'boolean'}
    }
  }})
  privateKeys: Array<ApiKey> = [];

  @type.boolean
  @validate.required
  @io.all
  openUserRegistration: boolean = true;

  @type.select({options: ['emailOrMobile', 'emailAndMobile', 'emailOnly', 'mobileOnly', 'none']})
  @validate.required
  @io.all
  createAccountValidation: 'emailOrMobile' | 'emailAndMobile' | 'emailOnly' | 'mobileOnly' | 'none' = 'emailOrMobile';

  @type.array({type: 'string'})
  @io.all
  createAccountRoles: Array<string> = [];

  @type.boolean
  @io.all
  requireDoubleAuth: boolean = false;

  @type.select({options: ['auto', 'email', 'sms']})
  @io.all
  doubleAuthMethod: string = 'auto';

  @type.boolean
  @io.all
  enableShop: boolean = false;

  @type.boolean
  @io.all
  enableMultipleShops: boolean = false;

  @type.array({type: 'string'})
  @io.all
  availableRoles: Array<string> = ['admin', 'user', 'shop'];

  @type.array({type: 'string'})
  @io.all
  adminUserRoles: Array<string> = ['admin', 'user'];

  @type.array({type: 'string'})
  @io.all
  adminShopRoles: Array<string> = ['admin', 'shop'];

  @type.boolean
  @io.all
  enableThree: boolean = false;

  @type.array({type: 'string'})
  @io.all
  adminThreeRoles: Array<string> = ['admin', 'three'];

  @type.array({type: 'object', options: {
    keys: {
      _id: {type: 'model', options: {model: UserModel}},
      roles: {type: 'array', options: {type: 'string'}}
    }
  }})
  @io.output
  @io.toDocument
  users: Array<AppUserItem> = [];

  @type.array({type: 'string'})
  @io.all
  locales: Array<string> = ['fr', 'en'];

  @type.string
  @io.all
  defaultLocale: string = 'fr';

  @type.string
  @io.all
  smtpConfigHost: string = '';

  @type.integer
  @io.all
  smtpConfigPort: number = 587;

  @type.string
  @io.all
  smtpConfigUser: string = '';

  @type.string
  @io.all
  smtpConfigPassword: string = '';

  @type.boolean
  @io.all
  smtpConfigSecure: boolean = false;

  @type.string
  @io.all
  smtpConfigFromName: string = '';

  @type.string
  @io.all
  smtpConfigFromEmail: string = '';

  @type.boolean
  @io.all
  pushEnabled: boolean = false;

  @type.string
  @io.all
  pushGmId: string = '';

  @type.string
  @io.all
  pushApnCert: string = '';

  @type.string
  @io.all
  pushApnKey: string = '';

  @type.string
  @io.all
  pushApnPass: string = '';

  @type.boolean
  @io.all
  pushApnProduction: boolean = false;

  @type.string
  @io.all
  pushTopic: string = '';

  output(): Promise<any> {
    return super.output().then((element) => {
      let publicKeys: Array<any> = [];
      for (let index in this.publicKeys) {
        let key = this.publicKeys[index];
        if (key.key) {
          continue;
        }
        publicKeys.push({name: key.name, expires: key.expires, active: key.active, last4: key.key.substr(-4)});
      }
      element.publicKeys = publicKeys;

      let privateKeys: Array<any> = [];
      for (let index in this.privateKeys) {
        let key = this.privateKeys[index];
        if (key.key) {
          continue;
        }
        privateKeys.push({name: key.name, expires: key.expires, active: key.active, last4: key.key.substr(-4)});
      }
      element.privateKeys = privateKeys;
      return element;
    });
  }

  toDocument(operation: 'insert' | 'update' | 'upsert'): Promise<UpdateQuery> {
    return super.toDocument(operation).then((data: UpdateQuery) => {
      let document = data.getInsertDocument();
      if (!document.roles || !Array.isArray(document.roles)) document.roles = ['admin'];
      if (document.roles.indexOf('admin') === -1) document.roles.push('admin');
      data.set('roles', document.roles);
      return data;
    });
  }

  static generateKey() {
    let len = 12;
    return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
  }
}

// the following lines fixes the AppModel config of the appId property of the UserModel.
// this is necessary because there is a circular reference between AppModel and UserModel
// and the decorating concept fails to link the two correctly
setTimeout(() => {
  AppModel.deco.propertyTypesOptions.users.options.keys._id.options.model = UserModel
}, 2000); 