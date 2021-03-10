"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let debug = require('debug')('deco-api:helpers:update-query');
class UpdateQuery {
    constructor() {
        this.$set = {};
        this.$unset = {};
        this.$addToSet = {};
        this.$push = {};
        this.$slice = {};
        return this;
    }
    addValue(place, propertyOrObject, value) {
        if (typeof propertyOrObject !== 'string' && value !== undefined)
            throw new Error('It is not permitted to provide a value when propertyOrObject is not a string');
        if (typeof propertyOrObject === 'string') {
            this[place][propertyOrObject] = value;
        }
        else if (typeof propertyOrObject === 'object') {
            this[place] = propertyOrObject;
        }
    }
    set(propertyOrObject, value) {
        this.addValue('$set', propertyOrObject, value);
        return this;
    }
    unset(propertyOrObject, value) {
        this.addValue('$unset', propertyOrObject, value);
        return this;
    }
    addToSet(propertyOrObject, value) {
        this.addValue('$addToSet', propertyOrObject, value);
        return this;
    }
    push(propertyOrObject, value) {
        this.addValue('$push', propertyOrObject, value);
        return this;
    }
    slice(propertyOrObject, value) {
        this.addValue('$slice', propertyOrObject, value);
        return this;
    }
    getInsertDocument() {
        return this.$set;
    }
    getUpdateQuery() {
        let query = {};
        if (this.$set && Object.keys(this.$set).length) {
            query.$set = this.$set;
        }
        if (this.$unset && Object.keys(this.$unset).length) {
            query.$unset = this.$unset;
        }
        if (this.$addToSet && Object.keys(this.$addToSet).length) {
            query.$addToSet = this.$addToSet;
        }
        if (this.$push && Object.keys(this.$push).length) {
            query.$push = this.$push;
        }
        if (this.$slice && Object.keys(this.$slice).length) {
            query.$slice = this.$slice;
        }
        return query;
    }
}
exports.UpdateQuery = UpdateQuery;
//# sourceMappingURL=update-query.js.map