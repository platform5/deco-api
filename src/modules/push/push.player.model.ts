import { UserModel } from './../user/user.model';
import { AppModel } from './../app/app.model';
import { model, Model, type, io, query, validate, ObjectId, StringNumberMap, mongo } from '../../';
let debug = require('debug')('app:models:dico');

export interface NbPlayers {
  nb: number;
  inactive?: number;
}

@model('pushplayer')
export class PushPlayerModel extends Model {

  @type.model({model: AppModel})
  @io.all
  @query.filterable({type: 'auto'})
  @validate.required
  @mongo.index({type: 'single'})
  public appId: ObjectId;

  @type.model({model: UserModel})
  @io.all
  @query.filterable({type: 'auto'})
  @mongo.index({type: 'single'})
  public userId?: ObjectId | null = null;

  @type.string
  @io.input
  @io.toDocument
  @mongo.index({type: 'single'})
  public regId: string;

  @type.string
  @io.input
  @io.toDocument
  public uuid: string;

  @type.select({options: ['fcm', 'apn']})
  @io.all
  @query.filterable({type: 'auto'})
  public type: 'fcm' | 'apn'

  @type.date
  @io.all
  @query.filterable({type: 'auto'})
  public lastVisit: Date;

  @type.array({type: 'string'})
  @io.all
  @query.filterable({type: 'auto'})
  public tags: Array<string> = [];

  @type.boolean
  @io.all
  public active: boolean = true;

  constructor() {
    super();
    this.model = PushPlayerModel;
  }

  static nbPlayers(appId: ObjectId): Promise<NbPlayers> {
    return Promise.all([
      PushPlayerModel.deco.db.collection(PushPlayerModel.deco.collectionName).find({appId: appId, active: true}).count(),
      PushPlayerModel.deco.db.collection(PushPlayerModel.deco.collectionName).find({appId: appId, active: false}).count()
    ]).then((values) => {
      return {
        nb: values[0],
        inactive: values[1]
      };
    });
  }

  static tags(appId: ObjectId): Promise<StringNumberMap> {
    return PushPlayerModel.deco.db.collection(PushPlayerModel.deco.collectionName).aggregate([ 
      { $match : { appId : appId, active: true } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } }
    ]).toArray().then((result) => {
      let tags: StringNumberMap = {};
      for (let r of result) {
        tags[r._id] = r.count;
      }
      return tags;
    });
  }
  
}