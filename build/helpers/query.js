"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let debug = require('debug')('deco-api:helpers:query');
class Query {
    constructor(query = null) {
        this._queries = [];
        this._orderBy = {};
        this._limit = 0;
        this._skip = 0;
        if (query !== null)
            this.addQuery(query);
        return this;
    }
    addQuery(query = {}) {
        if (typeof query !== 'object' || query instanceof Object === false)
            throw new Error('Invalid query parameter');
        if (Object.keys(query).length)
            this._queries.push(query);
        return this;
    }
    addQueryForKey(key, query = {}) {
        let queryForKey = {};
        queryForKey[key] = query;
        return this.addQuery(queryForKey);
    }
    orderBy(field, direction = 'ASC') {
        if (typeof field !== 'string')
            throw new Error('Invalid field parameter');
        this._orderBy[field] = (direction.toLowerCase() === 'asc') ? 1 : -1;
        return this;
    }
    limit(nb) {
        if (typeof nb === 'string') {
            nb = parseInt(nb, 10);
        }
        if (nb !== null && typeof nb !== 'number')
            throw new Error('Invalid nb parameter');
        if (nb === null)
            this._limit = 0;
        else
            this._limit = nb;
        return this;
    }
    skip(nb) {
        if (typeof nb === 'string') {
            nb = parseInt(nb, 10);
        }
        if (nb !== null && typeof nb !== 'number')
            throw new Error('Invalid nb parameter');
        if (nb === null)
            this._skip = 0;
        else
            this._skip = nb;
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
        if (this._queries.length === 0)
            return {};
        return (this._queries.length === 1) ? this._queries[0] : { $and: this._queries };
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
exports.Query = Query;
//# sourceMappingURL=query.js.map