import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId, mongo, Policies } from '../../';
let debug = require('debug')('app:models:dynamicconfig');

export interface DynamicField {
  name: string;
  type: 'any' | 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'array' | 'object' | 'file' | 'files' | 'model' | 'models';
  options: any;
  required: boolean;
  filterable: 'no' | 'auto' | 'equal' | 'number' | 'text' | 'categories' | 'tags' | 'date' | 'id' | 'ids' | 'boolean';
  searchable: boolean;
  sortable: boolean;
}

@model('dynamicconfig')
export class DynamicConfigModel extends Model {

  @type.model({model: AppModel})
  @io.all
  @validate.required
  @query.filterable({type: 'auto'})
  @mongo.index({type: 'single'})
  public appId: ObjectId | null = null;

  @type.model({model:AppModel})
  @io.all
  @validate.required
  @query.filterable({type: 'auto'})
  @mongo.index({type: 'single'})
  public relatedToAppId: ObjectId | null = null;

  @type.string
  @io.all
  @validate.required
  @query.sortable
  public name: string = '';

  @type.string
  @io.all
  @validate.slug
  @validate.required
  @mongo.index({type: 'single'})
  public slug: string = '';

  @type.boolean
  @io.all
  public isPublic: boolean = false;

  @type.select({options: ['all', 'creator', 'users', 'usersWithRoles']})
  @io.all
  public readingAccess: string = 'all';

  @type.array({type: 'string'})
  @io.all
  public readingRoles: Array<string> = [];
  
  @type.select({options: ['all', 'creator', 'users', 'usersWithRoles']})
  @io.all
  public writingAccess: string = 'all';
  
  @type.array({type: 'string'})
  @io.all
  public writingRoles: Array<string> = [];

  @type.array({type: 'object', options: {
    keys: {
      name: {type: 'string'},
      options: {type: 'any'},
      required: {type: 'boolean'},
      type: {type: 'string'},
      validation: {type: 'array', options: {type: 'ane'}},
      filterable: {type: 'string'},
      searchable: {type: 'boolean'},
      sortable: {type: 'boolean'},
    }
  }})
  @io.all
  public fields: Array<DynamicField> = [];

  @type.string
  @io.all
  public label: string;

  @type.boolean
  @io.all
  public enableAdminNotification = false;

  @type.boolean
  @io.all
  public enableUserNotification = false;

  @type.select({options: ['email'], multiple: true})
  @io.all
  public notificationType: 'email' = 'email';

  @type.select({options: ['create', 'edit', 'delete'], multiple: true})
  @io.all
  public notifyWhen: 'create' | 'edit' | 'delete' = 'create';

  @type.string
  //@validate.email // because it can also be notify:userId
  @io.all
  public notificationAdminEmail: string;

  @type.string
  @io.all
  public notificationAdminSubject: string;

  @type.string
  @io.all
  public notificationAdminContentPrefix: string;

  @type.string
  @io.all
  public notificationAdminContentSuffix: string;

  @type.string
  @io.all
  public notificationAdminTemplate: string;

  @type.string
  @io.all
  public notificationUserField: string;

  @type.string
  @io.all
  public notificationUserSubject: string;

  @type.string
  @io.all
  public notificationUserContentPrefix: string;

  @type.string
  @io.all
  public notificationUserContentSuffix: string;

  @type.string
  @io.all
  public notificationUserTemplate: string;

  @type.object({keys: {
    globalModelPolicy: {type: 'any'},
    readModelPolicy: {type: 'any'},
    writeModelPolicy: {type: 'any'},
    getAllPolicy: {type: 'any'},
    getOnePolicy: {type: 'any'},
    postPolicy: {type: 'any'},
    putPolicy: {type: 'any'},
    deletePolicy: {type: 'any'},
    globalIOPolicy: {type: 'any'},
    inputPolicy: {type: 'any'},
    outputPolicy: {type: 'any'}
  }})
  @io.all
  public policy: Policies.Policy = {};

}