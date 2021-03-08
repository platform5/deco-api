let debug = require('debug')('deco-api:helpers:update-query');

export class UpdateQuery {
  public $set: any = {}
  public $unset: any = {};
  public $addToSet: any = {};
  public $push: any = {};
  public $slice: any = {};
  
  constructor() {
    return this;
  }

  private addValue(place: '$set' | '$unset' | '$addToSet' | '$push' | '$slice' , propertyOrObject: string | object, value?: any) {
    if (typeof propertyOrObject !== 'string' && value !== undefined) throw new Error('It is not permitted to provide a value when propertyOrObject is not a string');
    if (typeof propertyOrObject === 'string') {
      this[place][propertyOrObject] = value;
    } else if (typeof propertyOrObject === 'object') {
      this[place] = propertyOrObject;
    }
  }

  set(propertyOrObject: string | object, value?: any) {
    this.addValue('$set', propertyOrObject, value);
    return this;
  }

  unset(propertyOrObject: string | object, value?: any) {
    this.addValue('$unset', propertyOrObject, value);
    return this;
  }

  addToSet(propertyOrObject: string | object, value?: any) {
    this.addValue('$addToSet', propertyOrObject, value);
    return this;
  }

  push(propertyOrObject: string | object, value?: any) {
    this.addValue('$push', propertyOrObject, value);
    return this;
  }

  slice(propertyOrObject: string | object, value?: any) {
    this.addValue('$slice', propertyOrObject, value);
    return this;
  }

  public getInsertDocument() {
    return this.$set;
  }

  public getUpdateQuery() {
    let query: any = {};
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