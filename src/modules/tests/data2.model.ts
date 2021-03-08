// import { model, Model, type, io, query, validate, ObjectId } from '../..';
// import { AppModel } from './../app/app.model';
// import { DataModel } from './data.model';
// let debug = require('debug')('app:models:dico');

// @model('data2')
// export class Data2Model extends Model {

//   @type.model({model: AppModel})
//   @io.all
//   @query.filterable({type: 'auto'})
//   @validate.required
//   public appId: ObjectId | null = null;

//   @type.model({model: DataModel})
//   @io.all
//   @query.filterable({type: 'auto'})
//   @validate.required
//   public dataId: ObjectId | null = null;

//   @type.string
//   @validate.required
//   @query.filterable({type: 'auto'})
//   @io.all
//   public title: string = '';
  
//   @type.models({model: DataModel})
//   @io.all
//   @query.filterable({type: 'auto'})
//   public dataIds: Array<ObjectId> = []; 
  
// }