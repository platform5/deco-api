let debug = require('debug')('deco-api:helpers:query');

export class Query {
  private _queries: Array<any> = [];
  private _orderBy: any = {};
  private _limit: number = 0;
  private _skip: number = 0;

  constructor(query: any | null = null) {
    if (query !== null) this.addQuery(query);
    return this;
  }

  addQuery(query: object = {}) {
    if (typeof query !== 'object' || query instanceof Object === false) throw new Error('Invalid query parameter');
    if (Object.keys(query).length) this._queries.push(query);
    return this;
  }

  addQueryForKey(key: string, query: object = {}) {
    let queryForKey: any = {};
    queryForKey[key] = query;
    return this.addQuery(queryForKey);
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC') {
    if (typeof field !== 'string') throw new Error('Invalid field parameter');
    this._orderBy[field] = (direction.toLowerCase() === 'asc') ? 1 : -1;
    return this;
  }

  limit(nb: string | number | null) {
    if (typeof nb === 'string') {
      nb = parseInt(nb, 10);
    }
    if (nb !== null && typeof nb !== 'number') throw new Error('Invalid nb parameter');
    if (nb === null) this._limit = 0;
    else  this._limit = nb;
    return this;
  }

  skip(nb: string | number | null) {
    if (typeof nb === 'string') {
      nb = parseInt(nb, 10);
    }
    if (nb !== null && typeof nb !== 'number') throw new Error('Invalid nb parameter');
    if (nb === null) this._skip = 0;
    else  this._skip = nb;
    return this;
  }

  complete() {
    return {
      $query: this.onlyQuery(),
      $sort: this._orderBy
    };
  }

  print() {
    return JSON.stringify(this.complete());
  }

  onlyQuery() {
    if (this._queries.length === 0) return {};
    return (this._queries.length === 1) ? this._queries[0] : {$and: this._queries};
  }

  onlySort() {
    return this._orderBy;
  }

  onlySkip() {
    return this._skip;
  }

  onlyLimit() {
    return this._limit;
  }
}