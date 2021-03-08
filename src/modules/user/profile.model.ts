import { AppModel } from './../app/app.model';
import { UserModel } from './user.model';
import { model, Model, type, io, query, validate, ObjectId, mongo, Policies } from '../../';
let debug = require('debug')('app:models:profile');

@model('profile')
@Policies.modelPolicy('getAll', {public: false, userIdByProperty: '_createdBy'})
@Policies.modelPolicy('getOne', {public: false, userIdByProperty: '_createdBy'})
@Policies.modelPolicy('put', {public: false, userIdByProperty: '_createdBy'})
export class ProfileModel extends Model {

  @type.model({model: AppModel})
  @io.all
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId | null = null;

  @type.model({model: UserModel})
  @io.all
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public userId: ObjectId | null = null;

  @type.file({accepted: ['image/*']})
  @io.all
  public picture: any;

  @type.string
  @io.all
  public street: string;

  @type.string
  @io.all
  public zip: string;

  @type.string
  @io.all
  public city: string;

  @type.string
  @io.all
  public country: string;

  @type.string
  @io.all
  public company: string;

  @type.string
  @io.all
  public department: string;
  
}