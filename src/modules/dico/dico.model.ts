import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId, mongo } from '../../';
let debug = require('debug')('app:models:dico');

@model('dico')
export class DicoModel extends Model {

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
  @query.searchable
  @query.filterable({type: 'auto'})
  @query.sortable
  @mongo.index({type: 'single'})
  public key: string = '';

  @type.string({multilang: true, locales: []})
  @io.all
  @query.searchable
  @validate.required
  public value: string = '';

  @type.array({type: 'string'})
  @io.all
  @query.searchable
  @query.filterable({type: 'auto'})
  public tags: Array<string> = [];
}