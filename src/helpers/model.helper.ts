import { Model, Query } from '../';

export interface TagCount {
  tag: string;
  count: number
}

export class ModelHelper {
  public static async fetchTags(model: typeof Model, query: Query, order: 'alpha' | 'count' = 'alpha'): Promise<Array<TagCount>> {
    const sort = order === 'alpha'
      ? { _id: 1 }
      : { counts: -1, _id: 1 }
    const tags = await model.deco.db.collection(model.deco.collectionName).aggregate(
      [{
        $match: query.onlyQuery()
      },
        {
          $project: {
              tags: 1
          }
      }, {
          $match: {
              "tags.0": { $exists: true }
          }
      }, {
          $unwind: {
              path: "$tags", preserveNullAndEmptyArrays: false }
      }, {
          $group: {
              _id: "$tags",
              tag: { $first: "$tags" },
              count: { $sum: 1 }
          }
      }, {
          $sort: sort
      }]
    ).toArray();
    return tags;
  }
}