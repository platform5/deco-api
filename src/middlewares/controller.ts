import { GetAllOptions, GetOneOptions } from './../decorators/model';
import { StringAnyMap, StringTMap } from '../interfaces/types';
import { ControllerHooksMiddleware } from './controller.hooks';
import { Model } from "../decorators";
import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { Query } from '../helpers/query';
import { Settings } from '../helpers/settings';
import moment from 'moment';
import fs from 'fs';
import { Deco, RelatedModel } from '../interfaces';
import { relations } from '../decorators/types/models';
import resolvePath from 'object-resolve-path';
import traverse from 'traverse';

let debug = require('debug')('deco-api:middleware:controller');
let afDebug = require('debug')('autofetch:');

export interface RelatedModelFilterQueryConfig {
  model: typeof Model,
  deco: Deco,
  queryKey: string;
  queriedModelKey: string;
  queriedModelIdKey: string;
  finalReqKey: string;
  direction: 'original' | 'detected';
  baseQuery?: Query;
  multiple: boolean;
}

export interface ControllerGetAllOptions {
  ignoreOutput?: boolean;
  ignoreSend?: boolean;
  addCountInKey?: string;
  enableLastModifiedCaching?: boolean;
}

export interface ControllerGetOneOptions {
  ignoreOutput?: boolean;
  ignoreSend?: boolean;
  ignoreDownload?: boolean;
}

export interface ControllerPostOptions {
  ignoreSend?: boolean;
  ignoreOutput?: boolean;
}
export interface ControllerPostManyOptions extends ControllerPostOptions {
  quantity?: number;
}

export interface AutoFetchConfig {
  originalKey: string;
  matchingKeyInRelatedModel: string;
  destinationKey: string;
  model: typeof Model;
  deco?: Deco | Promise<Deco>;
  baseQuery?: any,
  includeModelProp: Array<string>;
  fetchMultiple?: boolean;
}

export interface ControllerPutOptions {
  ignoreOutput?: boolean; // default false
  ignoreSend?: boolean; // default false
  setUpdatePropertiesWithBodyKeys?: boolean; // default true
}

export class ControllerMiddleware extends ControllerHooksMiddleware {

  constructor(public model: typeof Model) {
    super();
    return this;
  }

  getModelDeco(req: Request, res: Response): Deco {
    return this.model.deco;
  }

  static queryFromReq(req: Request, res: Response, deco: Deco, options?: QueryFromReqOptions): Promise<Query> {
    let instance = new ControllerMiddleware(Model);
    return instance.queryFromReq(req, res, deco);
  }

  queryFromReq(req: Request, res: Response, deco?: Deco, options?: QueryFromReqOptions): Promise<Query> {
    if (!deco) {
      // check if we have the right model
      if (!this.model) throw new Error('queryFromReq: missing deco or model');
    }
    let query = new Query();

    if (options?.filterQueries) {
      for (const q of options.filterQueries) {
        query.addQuery(q);
      }
    }

    return this.queryBefore(req, res, query, deco).then((query) => {
      return this.sortQueryFromReq(req, res, query, deco);
    }).then((query) => {
      return this.limitQueryFromReq(req, res, query, deco);
    }).then((query) => {
      return this.searchQueryFromReq(req, res, query, deco, options?.searchQuery);
    }).then((query) => {
      return this.addRelatedModelsFiltersInReq(req, res, query, deco);
    }).then(() => {
      return this.filterQueryFromReq(req, res, query, deco);
    }).then((query) => {
      return this.queryAfter(req, res, query, deco);
    });
  }

  sortQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query> {
    if (!req.query || !req.query.sort) return Promise.resolve(query);

    for (let sort of (req.query.sort as string).split(',')) {
      // sort can be (a) fieldName or (b) -fieldName
      // (a) order the query by fieldName in ASC order
      // (b) ordre the query by fieldName in DESC order

      let regexp = /^(-)?([a-zA-Z0-9_-]*)$/;
      let match;

      if ( (match = regexp.exec(sort)) === null) continue;

      if (match.index === regexp.lastIndex) {
        regexp.lastIndex++;
      }

      let direction: 'DESC'|'ASC' = (match[1] == '-') ? 'DESC' : 'ASC';
      let fieldName = match[2];

      if (!deco) deco = this.getModelDeco(req, res);

      let sortables: Array<string> = deco.propertySortables.map(v => v);
      sortables.push('_createdAt');
      sortables.push('_updatedAt');

      if(sortables.indexOf(fieldName) !== -1) {
        const isMultilang = deco.propertyTypesOptions[fieldName]?.multilang === true;
        if (isMultilang && req.query.locale) {
          fieldName += `.${req.query.locale}`;
        }
        query.orderBy(fieldName, direction)
      }
    }

    return Promise.resolve(query);
  }

  limitQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query> {
    if (req.query.limit) {
      query.limit(parseInt((req.query.limit as string), 10));
    }
    if (req.query.skip) {
      query.skip(parseInt((req.query.skip as string), 10));
    }
    return Promise.resolve(query);
  }

  searchQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco, searchQuery: {$or: Array<any>} = {$or: []}): Promise<Query> {
    if (!req.query || !req.query.q) return Promise.resolve(query);

    if (!deco) deco = this.getModelDeco(req, res);

    for (let prop of deco.propertySearchables) {
      const type = deco.propertyTypes[prop].name;
      const isNumber = type === 'integer' || type === 'float' || type.substr(0, 13) === 'increment-by-';
      if (isNumber) {
        let query = { $where: `/.*${this.escapeRegExp((req.query.q as string))}.*/.test(this.${prop})` };
        searchQuery.$or.push(query);
        continue;
      }
      const isMultilang = deco.propertyTypesOptions[prop]?.multilang === true;
      if (isMultilang && req.query.locale) {
        prop += `.${req.query.locale}`;
      }
      let search: StringAnyMap = {};
      search[prop] = {
        $regex: this.prepareSearchRegexp((req.query.q as string)),
        $options: '-i'
      };
      searchQuery.$or.push(search);
      searchQuery.$or.push(search);
    }

    if (searchQuery.$or.length) query.addQuery(searchQuery);
    return Promise.resolve(query);
  }

  private prepareSearchRegexp(q: string) {
    if (q.substr(0, 1) === '$') {
      // we assume the content of the search is a regexp
      return q.substr(1);
    } else {
      // we assume the content of the search is not a regexp and therefore we must escape
      // special regexp characters
      return '.*' + this.escapeRegExp(q) + '.*';
      }
    }

  private escapeRegExp(str: string) {
    return ".*" + str.replace(/[.*+\-?^${}()|[\]\\\/]/g, '\\$&') + ".*"; // $& means the whole matched string
  }

  addRelatedModelsFiltersInReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<void> {
    let relatedQueriesSettings: Array<RelatedModelFilterQueryConfig> = [];
    return this.findOriginalModelRelations(req, res, relatedQueriesSettings, deco).then((relatedQueriesSettings) => {
      return this.findDetectedModelRelations(req, res, relatedQueriesSettings);
    }).then((relatedQueriesSettings) => {
      return this.placeRelationalFiltersInReq(req, res, relatedQueriesSettings, query, deco);
    });
  }

  findOriginalModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>, deco?: Deco): Promise<Array<RelatedModelFilterQueryConfig>> {
    if (!deco) deco = this.getModelDeco(req, res);
    for (let prop in deco.propertyTypes) {
      let type = deco.propertyTypes[prop];
      if (type.name === 'model' || type.name === 'models') {
        let options = deco.propertyTypesOptions[prop];
        if (options.model && options.model.getAll) {
          let relatedDeco = options.model.deco;
          relatedQueriesSettings.push({
            model: options.model,
            deco: relatedDeco,
            queryKey: prop,
            queriedModelKey: 'subKey',
            queriedModelIdKey: '_id',
            finalReqKey: prop, // or 'id' ====>>> TODO: TEST TEST TEST !!!
            direction: 'original',
            multiple: type.name === 'models'
          });
        }
      }
    }
    return Promise.resolve(relatedQueriesSettings);
  }

  findDetectedModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>> {
    let relatedModels: Array<any> = [];
    for (let relation of relations) {
      if (relation.toModel === this.model) {
        relatedModels.push(relation);
      }
    }
    for (let relatedModel of relatedModels) {
      if (relatedModel.fromModel.getAll) {
        let query = new Query();
        let relatedDeco = relatedModel.fromModel.deco;
        relatedQueriesSettings.push({
          model: relatedModel.fromModel,
          deco: relatedDeco,
          queryKey: relatedDeco.modelName,
          queriedModelKey: 'subKey',
          queriedModelIdKey: relatedModel.key,
          finalReqKey: 'id',
          direction: 'detected',
          multiple: relatedModel.type === 'models'
        });
      }
    }
    return Promise.resolve(relatedQueriesSettings);
  }

  placeRelationalFiltersInReq(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>, query: Query, deco?: Deco): Promise<void> {
    let promises: Array<Promise<any>> = [];

    for (let relatedQuerySettings of relatedQueriesSettings) {
      let relatedQuery: Query = relatedQuerySettings.baseQuery || new Query();
      let queryProps: StringAnyMap = {};

      for (let prop in req.query) {
        if (prop.indexOf('.') === -1) continue;
        let match = prop.match(/^(.*)\.(.*)$/);
        if (match && match[1] === relatedQuerySettings.queryKey) {
          let subKey = match[2];
          queryProps[subKey] = req.query[prop];
        }
      }

      if (Object.keys(queryProps).length === 0) continue;

      let promise = this.filterQueryFromDeco(relatedQuerySettings.deco, relatedQuery, queryProps).then((relatedQuery) => {
        return relatedQuerySettings.model.getAll(relatedQuery, {deco: relatedQuerySettings.deco});
      }).then((elements) => {
        let ids = '';
        let remoteKey = relatedQuerySettings.queriedModelIdKey;// relatedQuerySettings.direction === 'original' ? '_id' : relatedQuerySettings.key;
        if (!relatedQuerySettings.multiple) {
          ids = elements.map((i: any) => i[remoteKey].toString()).join(',');
        } else {
          ids = elements.map((item: any) => {
            let value = item[remoteKey];
            if (!value) return '';
            if (Array.isArray(value))
            return value.map(i => i.toString());
          }).join(',');
        }
        if (!deco) deco = this.getModelDeco(req, res);
        this.extendQueryBasedOnDecoPropAndValue(query, deco, relatedQuerySettings.finalReqKey, ids);
      });
      promises.push(promise);
    }

    return Promise.all(promises).then(() => {
      return;
    });
  }

  filterQueryFromDeco(deco: Deco, query: Query, queryProps: StringAnyMap): Promise<Query> {
    if (deco.propertyFilterables.indexOf('_createdAt') === -1) deco.propertyFilterables.push('_createdAt');
    if (deco.propertyFilterables.indexOf('_updatedAt') === -1) deco.propertyFilterables.push('_updatedAt');
    if (deco.propertyFilterables.indexOf('_createdBy') === -1) deco.propertyFilterables.push('_createdBy');
    if (deco.propertyFilterables.indexOf('_updatedBy') === -1) deco.propertyFilterables.push('_updatedBy');
    if (deco.propertyFilterables.indexOf('id') === -1) deco.propertyFilterables.push('id');
    deco.propertyFilterablesOptions._createdAt = { type: 'date' };
    deco.propertyFilterablesOptions._updatedAt = { type: 'date' };
    deco.propertyFilterablesOptions._createdBy = { type: 'id' };
    deco.propertyFilterablesOptions._updatedAt = { type: 'id' };
    deco.propertyFilterablesOptions.id = { type: 'ids' };

    for (let prop of deco.propertyFilterables) {
      let filterValue = queryProps[prop];
      if (filterValue === undefined) continue; // only filter if there is a ?prop=... query parameter in the request uri
      this.extendQueryBasedOnDecoPropAndValue(query, deco, prop, filterValue);
    }

    if (queryProps['__global__']) this.extendQueryBasedOnDecoPropAndValue(query, deco, '__global__', queryProps['__global__']);

    return Promise.resolve(query);
  }

  filterQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query> {
    if (!deco) deco = this.getModelDeco(req, res);
    return this.filterQueryFromDeco(deco, query, req.query);
  }

  extendQueryBasedOnDecoPropAndValue(query: Query, deco: Deco, prop: string, filterValue: any): void {
    if (filterValue === undefined) return; // only filter if there is a ?prop=... query parameter in the request uri
    let fieldType: string = '';
    let filterOptions: any = {};
    if (prop === 'id') {
      fieldType = '_id';
      filterOptions = {type: 'ids'};
    } else if (prop === '_updatedAt' || prop === '_createdAt') {
      fieldType = 'date';
      filterOptions = {type: 'date', dateFormat: 'YYYY-MM-DDTHH:mm:ssZ'};
    } else if (prop === '__global__') {
      fieldType = 'query';
      filterOptions = {type: 'query'};
    } else {
      fieldType = deco.propertyTypes[prop].name;
      filterOptions = deco.propertyFilterablesOptions[prop] || {};
    }
    if (typeof filterValue === 'string') {
      let queryMatch = filterValue.match(/^<(.*)>$/);
      if (queryMatch) {
        try {
          filterValue = JSON.parse(queryMatch[1]);
          filterOptions.type = 'query';
        } catch (error) {
          throw new Error('Invalid query search');
        }
      } 
    }
    if (filterOptions.type === 'auto') {
      switch(fieldType) {
        case 'string': filterOptions.type = 'text'; break;
        case 'integer': filterOptions.type = 'number'; break;
        case 'float': filterOptions.type = 'number'; break;
        case 'date': filterOptions.type = 'date'; break;
        case 'boolean': filterOptions.type = 'boolean'; break;
        case 'array': filterOptions.type = 'array'; break;
        case 'select': filterOptions.type = 'equal'; break;
        case 'model': filterOptions.type = 'id'; break;
        case 'models': filterOptions.type = 'categories'; filterOptions.ObjectId = true; break;
      }
    }

    if (filterOptions.type === 'equal') {
      let q:any = {$or: []};
      let values = filterValue.split(',');
      for (let index in values) {
        let qq: any = {};
        qq[prop] = values[index].trim();
        q.$or.push(qq);
      }
      if (q.$or.length) query.addQuery(q);
    }

    if (filterOptions.type === 'number') {

      if (filterValue.indexOf(':') === -1) {
        // perform an OR query of any values given, separated by comma
        let q:any = {$or: []};
        let values = filterValue.split(',');
        for (let index in values) {
          let qq: any = {};
          qq[prop] = parseFloat(values[index].trim());
          q.$or.push(qq);
        }
        if (q.$or.length) query.addQuery(q);
      } else {
        let values = filterValue.split(':');
        let fromValue = values[0] === '' ? null : parseFloat(values[0]);
        let toValue = values[1] === '' ? null : parseFloat(values[1]);
        let q:any = {};
        q[prop] = {};
        if (typeof fromValue === 'number') {
          q[prop]['$gte'] = fromValue;
        }
        if (typeof toValue === 'number') {
          q[prop]['$lte'] = toValue;
        }
        query.addQuery(q);
      }
    }
    
    if (filterOptions.type === 'text') {
      let q:any = {$or: []};
      let values = filterValue.split(',');
      for (let index in values) {
        let qq:any ={};
        const v = this.escapeRegExp(values[index].trim());
        qq[prop] = {
          $regex: ".*" + v + ".*",
          $options: '-i'
        };
        q.$or.push(qq);
      }
      if (q.$or.length) query.addQuery(q);
    }

    if (filterOptions.type === 'categories') {
      // no filter if contains the _all_ keyword (meaning filtering by all)
      if (filterValue.indexOf('_all_') !== -1) return;

      let categories;
      if (filterOptions.ObjectId === false) {
        categories = filterValue.split(',').map((item:string) => item.trim() );
      } else {
        try {
          categories = filterValue.split(',').map((item:string) => new ObjectId(item.trim()) );
        } catch (error) {
          throw new Error(`Invalid ObjectId in relationTo filter`);
        }
      }
      let q:any = {};
      q[prop] = {
        $in: categories
      }
      query.addQuery(q);
    }

    if (filterOptions.type === 'tags') {
      // no filter if contains the _all_ keyword (meaning filtering by all)
      if (filterValue.indexOf('_all_') !== -1) return;
      let q:any = {};
      if (filterValue.indexOf('__none__') !== -1) {
        q[`${prop}.0`] = {$exists: false};
        query.addQuery(q);
        return;
      }
      let tags = filterValue.split(',').map((item: string) => item.trim() );
      q[prop] = {
        $all: tags
      }
      query.addQuery(q);
    }

    if (filterOptions.type === 'date') {
      // if field has ':' symbol in filterValue => it's a date range
      // the left part of ":" is from
      // the right part of ":" is to
      // if the field doesn't have the ":" symbol => it's an exact date

      //let value = req.query[field]; => filterValue
      let dateFormat = deco.propertyTypesOptions.dateFormat || Settings.defaultDateFormat;
      let fromDate = null;
      let toDate = null;
      if (filterValue.indexOf(':') === -1) {
        // perform an exact date match
        fromDate = moment(filterValue, dateFormat).startOf('day');
        toDate = moment(fromDate).add(1, 'days');
      } else {
        let dates = filterValue.split(':');
        fromDate = dates[0] ? moment(dates[0], dateFormat).startOf('day') : null;
        toDate = dates[1] ? moment(dates[1], dateFormat).endOf('day') : null;
      }

      let q:any = {};
      q[prop] = {};
      if (fromDate) {
        q[prop]['$gte'] = fromDate.toDate();
      }
      if (toDate) {
        q[prop]['$lte'] = toDate.toDate();
      }
      query.addQuery(q);
    }

    if (filterOptions.type === 'id') {
      if(prop === 'id') prop = '_id';

      if (!filterValue) {
        // filtering elements that do not have an on this ID field
        let q: any = {$or: []};
        let notExist: any = {};
        notExist[prop] = {$exists: false};
        let isnull: any = {};
        isnull[prop] = null;
        q.$or.push(notExist);
        q.$or.push(isnull);
        query.addQuery(q);
      } else {
        let id: ObjectId;
        try {
          id = new ObjectId(filterValue.trim());
        } catch (error) {
          throw new Error(`Invalid ObjectId in id filter (${filterValue})`);
        }
  
        let q: any = {};
        q[prop] = id;
        query.addQuery(q);
      }
    }

    if (filterOptions.type === 'ids') {
      if (!filterValue) {
        // filtering elements that do not have an on this ID field
        if(prop === 'id') prop = '_id';
        let q: any = {$or: []};
        let notExist: any = {};
        notExist[prop] = {$exists: false};
        let isnull: any = {};
        isnull[prop] = null;
        q.$or.push(notExist);
        q.$or.push(isnull);
        query.addQuery(q);
      } else {
        let ids = filterValue.split(',').map((item: string) => {
          let id: ObjectId;

          try {
            id = new ObjectId(item.trim());
          } catch (error) {
            throw new Error(`Invalid ObjectId in id filter (${item} in ${filterValue})`);
          }
  
          return id;
        });
        if(prop === 'id') prop = '_id';
        let q:any = {};
        q[prop] = {
          $in: ids
        };
        query.addQuery(q);
      }
    }

    if (filterOptions.type === 'boolean') {
      // passing all or -1 means true or false
      if (filterValue === 'all' || filterValue === -1) return;
      let value = null;
      if (filterValue === true || filterValue === 'true' || filterValue === 1 || filterValue === '1') {
        value = true;
      }
      if (filterValue === false || filterValue === 'false' || filterValue === 0 || filterValue === '0') {
        value = false;
      }
      if (value === null) {
        return;
      }

      let q: any = {};
      q[prop] = value;
      query.addQuery(q);
    }

    if (filterOptions.type === 'array') {
      // todo: array filter type
    }

    if (filterOptions.type === 'query') {
      traverse(filterValue).forEach(function(v) {
        if (typeof v === 'string' && v.substr(0, 3) === 'id:') {
          try {
            const id = new ObjectId(v.substr(3));
            this.update(id);
          } catch (error) {
            // do nothing
          }
        }
      });
      if (filterValue.$or && filterValue.$and) {
        throw new Error('Invalid query filter ($or and $and cannot be used together)');
      }
      if (filterValue.$or && Array.isArray(filterValue.$or)) {
        let orQuery: any = {$or: []};
        (filterValue.$or as Array<any>).reduce((array, query) => {
          let q: any = {};
          if (prop === '__global__') {
            q = query;
          } else {
            q[prop] = query;
          }
          array.$or.push(q);
          return array;
        }, orQuery);
        query.addQuery(orQuery);
      } else if (filterValue.$and && Array.isArray(filterValue.$and)) {
        let andQuery: any = {$and: []};
        (filterValue.$and as Array<any>).reduce((array, query) => {
          let q: any = {};
          if (prop === '__global__') {
            q = query;
          } else {
            q[prop] = query;
          }
          array.$and.push(q);
          return array;
        }, andQuery);
        query.addQuery(andQuery);
      } else {
        let q: any = {};
        if (prop === '__global__') {
          q = filterValue;
        } else {
          q[prop] = filterValue;
        }
        query.addQuery(q);
      }
    }
  }

  prepareQueryFromReq() {
    return (req: Request, res: Response, next: NextFunction) => {
      const options: QueryFromReqOptions = {};
      if (res.locals.searchQuery) {
        options.searchQuery = res.locals.searchQuery;
      }
      if (res.locals.filterQueries) {
        options.filterQueries = res.locals.filterQueries;
      }
      this.queryFromReq(req, res, undefined, options).then((query: Query) => {
        res.locals.query = query;
        next();
      }).catch(next);
    }
  }

  autoFetch(autoFetchConfigs: Array<AutoFetchConfig>, send: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
      let autoFetchSingleElement: boolean = false;
      afDebug('*** START AUTOFETCH ***', autoFetchConfigs);
      let elements: Array<Model> = res.locals.elements;
      if (!elements && res.locals.element) {
        elements = [res.locals.element];
        autoFetchSingleElement = true;
      }
      if (!req.query.autoFetch || !elements || !elements.length) {
        if (send) {
          res.send(elements);
        } else {
          next();
        }
        return;
      }
      let requestedAutoFetch = (req.query.autoFetch as string).split(',');
      
      
      afDebug('** requestedAutoFetch', requestedAutoFetch);
      let autoFetchIds: Array<Array<ObjectId>> = [];
      let autoFetchPromises: Array<Promise<any>> = [];

      // init autoFetchIds and autoFetchPromises
      autoFetchConfigs.map((value, index) => {
        autoFetchIds[index] = [];
        autoFetchPromises[index] = Promise.resolve();
      });

      function resolveValuesInArray(object: any, path: string) {
        let splitedPath = path.split('.');
        let lastProp = splitedPath[splitedPath.length - 1];
        let firstPath = splitedPath.slice(0, splitedPath.length - 1).join('.');
        let potentialArray = resolvePath(object, firstPath);
        if (!Array.isArray(potentialArray)) return undefined;
        return potentialArray.map(i => resolvePath(i, lastProp));
      }

      // collected all ids
      for (let element of elements) {
        for (let index in autoFetchConfigs) {
          let config = autoFetchConfigs[index];
          if (requestedAutoFetch.indexOf(config.destinationKey) === -1) continue;
          let el: any = element;
          let value = resolvePath(el, config.originalKey);
          if (value === undefined) {
            // try to get an array of value
            value = resolveValuesInArray(el, config.originalKey);
            if (value !== undefined) afDebug('yes, resolving with array function was helpful');
          }
          afDebug(`element [${config.originalKey}]`, value);
          if (!value) continue;
          if (value instanceof ObjectId) {
            autoFetchIds[index].push(value);
          } else if (typeof value === 'string') {
            let objId: ObjectId;
            try {
              objId = new ObjectId(value);
            } catch (error) {
              throw new Error('Invalid ObjectId when try auto-fetch');
            }
            autoFetchIds[index].push(objId);
          } else if (Array.isArray(value)) {
            for (let v of value) {
              let objId: ObjectId;
              try {
                objId = new ObjectId(v);
              } catch (error) {
                throw new Error('Invalid ObjectId when try auto-fetch');
              }
              autoFetchIds[index].push(objId);
            }
          }
        }
      }
      // fetch all related elements
      for (let index in autoFetchConfigs) {
        afDebug('autoFetchIds[index]', autoFetchIds[index]);
        if (!autoFetchIds[index].length) continue;
        let config = autoFetchConfigs[index];
        if (config.includeModelProp.indexOf(config.matchingKeyInRelatedModel) === -1) {
          config.includeModelProp.push(config.matchingKeyInRelatedModel);
        }
        let getAllConfig: GetAllOptions = {};
        let getAllConfigPromise = Promise.resolve(getAllConfig);
        if (config.deco) {
          getAllConfigPromise = Promise.resolve(config.deco).then((deco) => {
            getAllConfig = {deco: deco};
            return getAllConfig;
          });
        }
        let matchingKey = config.matchingKeyInRelatedModel;
        let q: any = {};
        q[matchingKey] = {$in: autoFetchIds[index]};
        let query: Query = new Query();
        if (config.baseQuery) query.addQuery(config.baseQuery);
        query.addQuery(q);
        afDebug('-----');
        afDebug('query for index', index, query.print());
        afDebug('-----');
        autoFetchPromises[index] = getAllConfigPromise.then((getAllConfig) => {
          return config.model.getAll(query, getAllConfig);
        }).then((relatedElements) => {
          if (relatedElements.length) {
            // some typeDecorator need the request in the element (exemple: StringDecorator)
            relatedElements.map(re => re.request = req);
            return config.model.outputList(relatedElements, config.includeModelProp, true);
          } 
          return relatedElements;
        });
      }

      return Promise.all(autoFetchPromises).then((elementsByConfig) => {
        for (let index in elementsByConfig) {
          if (!elementsByConfig[index]) elementsByConfig[index] = [];
          //afDebug(`elementsByConfig[${index}]`, elementsByConfig[index]);
          afDebug(`elementsByConfig[${index}]`, elementsByConfig[index].length, 'elements');
        }
        // include related elements
        afDebug('** Start Inluding Elements');
        for (let index in autoFetchConfigs) {
          afDebug('* Index', index);
          let config = autoFetchConfigs[index];
          if (!elementsByConfig[index] || !elementsByConfig[index].length) continue;
          let matchingKey = config.matchingKeyInRelatedModel;
          let elementsByIds: StringTMap<Model> = {};
          let elementsByIdsArray: StringTMap<Array<Model>> = {};
          for (let relatedElement of elementsByConfig[index]) {
            if (matchingKey === '_id' && relatedElement._id === undefined && relatedElement.id) {
              matchingKey = 'id';
            }
            let matchingId = relatedElement[matchingKey];
            elementsByIds[matchingId] = relatedElement;
            if (!elementsByIdsArray[matchingId]) elementsByIdsArray[matchingId] = [];
            elementsByIdsArray[matchingId].push(relatedElement);
          }
          for (let element of elements) {
            let el: any = element;
            let value = resolvePath(el, config.originalKey);
            if (value === undefined) {
              // try to get an array of value
              value = resolveValuesInArray(el, config.originalKey);
              if (value !== undefined) afDebug('yes, resolving with array function was helpful');
            }
            if (!value) continue;
            // scenarios:
            // 1. value is string or objectid and we fetch single value => save as single object
            // 2. value is string or objectid and we fetch multiple values => save as an array and push each releated element in this array
            // 3. value is array and we fetch single => save single object directly linked to the array value
            // 4. should we treat the case when value is array and we fetch array ???

            let isArray = (Array.isArray(value));
            let isMultiple = config.fetchMultiple === true;

            afDebug('scenario', 'isArray', isArray, 'isMultiple', isMultiple);

            if (!isArray && !isMultiple) {
              el[config.destinationKey] = elementsByIds[value.toString()];
            } else if (!isArray && isMultiple) {
              el[config.destinationKey] = elementsByIdsArray[value.toString()];
            } else if (isArray && !isMultiple) {
              let finalValue: Array<any> = [];
              for (let id of value) {
                let key = id.toString();
                if (elementsByIds[key]) finalValue.push(elementsByIds[key]);
                else finalValue.push(null);
              }
              el[config.destinationKey] = finalValue;
            } else if (isArray && isMultiple) {
              let finalValue: Array<any> = [];
              for (let id of value) {
                let key = id.toString();
                if (elementsByIdsArray[key]) finalValue.push(elementsByIdsArray[key]);
                else finalValue.push(null);
              }
              el[config.destinationKey] = finalValue;
            }
          }
        }
      
        if (send) {
          if (autoFetchSingleElement) {
            res.send(elements[0]);
          } else {
            res.send(elements);
          }
        } else {
          if (autoFetchSingleElement) {
            res.locals.element = elements[0];
          } else {
            res.locals.elements = elements;
          }
          next();
        }
      }).catch(next);
    }
  }

  public getAll(query: Query | null = null, options?: ControllerGetAllOptions) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      const currentRequestOptions = Object.assign({}, options);
      let _query: Query = new Query();
      if (query !== null && res.locals.query !== undefined) return next(new Error('Query is defined both from the getAll() call and the res.locals.query variable. This is not allowed.'))
      if (res.locals.query && res.locals.query instanceof Query) _query = res.locals.query;
      if (_query === null) _query = new Query();
      this.extendRequest(req, 'getAll').then(() => {
        return this.extendGetAllQuery(_query, req, res);
      }).then(async () => {
        let modelOptions: GetAllOptions = {};
        modelOptions.deco = this.getModelDeco(req, res);
        modelOptions.addCountInKey = currentRequestOptions?.addCountInKey;
        if (currentRequestOptions && currentRequestOptions.enableLastModifiedCaching) {
          const lastElements = await modelOptions.deco.db.collection(modelOptions.deco.collectionName)
          .find(_query.onlyQuery())
          .skip(_query.onlySkip())
          .limit(1)
          .sort({_updatedAt: -1}).toArray();
          res.setHeader('Cache-Control', 'private, must-revalidate');
          if (lastElements.length && lastElements[0]._updatedAt) {
            const DATE_RFC2822 = "ddd, DD MMM YYYY HH:mm:ss ZZ";
            const lastElementModified = moment(lastElements[0]._updatedAt).format(DATE_RFC2822);
            res.setHeader('Last-Modified', lastElementModified);
            if (req.header('If-Modified-Since') && req.header('If-Modified-Since') === lastElementModified) {
              res.send(304);
              currentRequestOptions.ignoreSend = true;
              return [];
            }
          }
        }
        return this.model.getAll(_query, modelOptions);
      }).then((elements) => {
        for (let element of elements) {
          element.request = req;
        }
        if (currentRequestOptions && currentRequestOptions.ignoreOutput) return Promise.resolve(elements);
        const allowExtra = currentRequestOptions?.addCountInKey ? [currentRequestOptions.addCountInKey] : [];
        return this.model.outputList(elements, undefined, false, allowExtra);
      }).then((element) => {
        return this.postOutputList(element, req, res);
      }).then((elements) => {
        res.locals.elements = elements;
        if (!currentRequestOptions || !currentRequestOptions.ignoreSend) res.send(elements);
        else next();
      }).catch(next);
    };
  }

  prepareGetOneQuery(elementId: string | ObjectId, req: Request, res: Response, options: GetOneOptions): Promise<Query> {
    if (typeof elementId === 'string') {
      try {
        elementId = new ObjectId(elementId);
      } catch (_error) {
        throw new Error('Invalid elementId');
      }
    }
    let query = new Query({_id: elementId});
    return this.extendGetOneQuery(query, req, res, options).then(() => {return query});
  }
  
  getOne(options?: ControllerGetOneOptions) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      let getOneOptions: GetOneOptions = {};
      this.extendRequest(req, 'getOne').then(() => {
        return this.getOneElementId(req.params.elementId, req, res);
      }).then((elementId) => {
        getOneOptions.deco = this.getModelDeco(req, res);
        return this.prepareGetOneQuery(elementId, req, res, getOneOptions);
      }).then((query) => {
        return this.model.getOneWithQuery(query, getOneOptions);
      }).then((element) => {
        if (!element) return Promise.reject('Element not found');
        element.request = req;
        return this.getOneElement(element, req, res);
      }).then((element) => {
        if (options && options.ignoreDownload) return Promise.resolve(element);
        return this.processDownload(req, res, element);
      }).then((element) => {
        if (res.locals.fileSent || (options && options.ignoreOutput)) return Promise.resolve(element);
        return element.output();
      }).then((element) => {
        return this.postOutput(element, req, res);
      }).then((element) => {
        res.locals.element = element;
        if (!res.locals.fileSent) {
          if (options && options.ignoreSend) {
            next();
          } else {
            res.send(element);
          }
        }
      }).catch(next);
    };
  }

  /**
   * Process the query to find any downloadable files
   * ?download=image : will try to download the file placed in the image property of the model (if any)
   * By default, it will download the original file, except if the query has a preview= parameter
   * ?preview=800:600 : will try to download the smaller file that has at least 800 px width and 600 px height
   * ?preview=800 : will try to download the smaller file that has at least 800 px width
   * ?preview=:600 : will try to download the smaller file that has at least 600 px height
   * For properties of type "files", the query must also contain a "fileId" paramater, indicating which file to download from the array
   */
  processDownload(req: Request, res: Response, element: Model): Promise<Model> {
    const env = process.env.NODE_ENV || 'production'; // benefit of the doubt to production environement
    if (!req.query || !req.query.download) return Promise.resolve(element);
    let prop:string = (req.query.download as string);
    let deco = this.getModelDeco(req, res);
    let fileProperties = Model.getDecoProperties(deco, ['file', 'files']);

    if (fileProperties.indexOf(prop) === -1) return Promise.resolve(element);
    // here we know that we have a download request for a file property
    if (!(element as any)[prop]) return Promise.reject('File not found');


    let typeDecorator = deco.propertyTypes[prop];
    let options = deco.propertyTypesOptions[prop];
    let propValue = (element as any)[prop];
    if (typeDecorator.name === 'files') {
      // because it's an array of files, we must find the right fileId
      if (!Array.isArray(propValue) || propValue.length === 0) return Promise.resolve(element);
      if (!req.query.fileId) return Promise.resolve(element);
      let found = false;
      for (let file of propValue) {
        if (file.filename === req.query.fileId) {
          propValue = file;
          found = true;
          break;
        }
      }
      if (!found) return Promise.resolve(element);
    }

    if (env === 'development' && (req.url.indexOf('localhost') !== -1 || req.url.indexOf('/stage/') !== -1)) {
      let replaceValues: StringTMap<any> = {
        "application/octet-stream": {
          "originalname": "dwg1.dwg",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "dcab268d062b473c3d6a68edb4ba8bcd",
          "path": "uploads-files-fake/dcab268d062b473c3d6a68edb4ba8bcd",
          "size": 2850878
        },
        "image/jpeg": {
          "originalname": "jpg4.jpg",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "5632ba3e5621632ad8c6f2aa84c2de44",
          "path": "uploads-files-fake/5632ba3e5621632ad8c6f2aa84c2de44",
          "size": 1933082,
          "width": 3264,
          "height": 1836,
          "ratio": 1.7777777777777777,
          "previews": [{
            "encoding": "7bit",
            "mimetype": "image/png",
            "destination": "uploads-files-fake/",
            "filename": "8ed95ad194cc5edfefb16660d18091d1",
            "path": "uploads-files-fake/8ed95ad194cc5edfefb16660d18091d1",
            "size": 148880,
            "width": 320,
            "height": 320,
            "ratio": 1
          }]
        },
        "image/jpg": {
          "originalname": "jpg4.jpg",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "5632ba3e5621632ad8c6f2aa84c2de44",
          "path": "uploads-files-fake/5632ba3e5621632ad8c6f2aa84c2de44",
          "size": 1933082,
          "width": 3264,
          "height": 1836,
          "ratio": 1.7777777777777777,
          "previews": [{
            "encoding": "7bit",
            "mimetype": "image/png",
            "destination": "uploads-files-fake/",
            "filename": "8ed95ad194cc5edfefb16660d18091d1",
            "path": "uploads-files-fake/8ed95ad194cc5edfefb16660d18091d1",
            "size": 148880,
            "width": 320,
            "height": 320,
            "ratio": 1
          }]
        },
        "application/pdf": {
          "originalname": "pdf1.pdf",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "2cce52ec1477e76d20c4aecbeaadd860",
          "path": "uploads-files-fake/2cce52ec1477e76d20c4aecbeaadd860",
          "size": 355708
        },
        "image/png": {
          "originalname": "png1.png",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "2030f0c59b17cc112badae78f7ee1879",
          "path": "uploads-files-fake/2030f0c59b17cc112badae78f7ee1879",
          "size": 820432,
          "width": 3508,
          "height": 6200,
          "ratio": 0.5658064516129032,
          "previews": [{
            "encoding": "7bit",
            "mimetype": "image/png",
            "destination": "uploads-files-fake/",
            "filename": "98c3a9b35002c6b0e2927d139bd5e4bf",
            "path": "uploads-files-fake/98c3a9b35002c6b0e2927d139bd5e4bf",
            "size": 23289,
            "width": 320,
            "height": 320,
            "ratio": 1
          }]
        },
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
          "originalname": "xlsx1.xlsx",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "a74455821ab12f60439c4f91a8f53dd8",
          "path": "uploads-files-fake/a74455821ab12f60439c4f91a8f53dd8",
          "size": 167257
        },
        "application/zip": {
          "originalname": "zip1.zip",
          "encoding": "7bit",
          "destination": "uploads-files-fake/",
          "filename": "a8e7b1120a8a530ceb66c821633f2d5a",
          "path": "uploads-files-fake/a8e7b1120a8a530ceb66c821633f2d5a",
          "size": 33009675
        }
      };

      if (replaceValues[propValue.mimetype]) {
        for (let key in replaceValues[propValue.mimetype]) {
          propValue[key] = replaceValues[propValue.mimetype][key];
        }
      } else {
        throw new Error(`This mimetype has no fake file (${propValue.mimetype})`)
      }
    }

    let downloadOriginal = (req.query.preview as string) ? false : true;
    let fileSettings:any;
    if (downloadOriginal) {
      fileSettings = propValue;
    }
    if (!downloadOriginal) {
      // determine the minHeight and minWidth
      let preview = (req.query.preview as string);
      let minWidth = 0;
      let minHeight = 0;
      if (preview.indexOf(':') === -1) {
        minWidth = parseInt(preview, 10);
      } else {
        let dims = preview.split(':');
        minWidth = dims[0] ? parseInt(dims[0], 10) : 0;
        minHeight = dims[1] ? parseInt(dims[1], 10) : 0;
      }
      if (typeof minWidth !== 'number' || typeof minHeight !== 'number' || isNaN(minWidth) || isNaN(minHeight)) return Promise.reject(new Error('Invalid preview request'));
      // find the best possible preview
      let currentFilePreview: any = null;
      let currentFilePreviewSize: number = Infinity;
      for (let preview of propValue.previews || []) {
        if (preview.width >= minWidth && preview.height >= minHeight && preview.size < currentFilePreviewSize) {
          currentFilePreview = preview;
          currentFilePreviewSize = preview.size;
        }
      }
      if (currentFilePreview) {
        fileSettings = currentFilePreview;
      } else {
        // if we don't find a matching preview, we can still return the original if it's an image
        if (propValue.mimetype.substr(0, 6) === 'image/') {
          fileSettings = propValue;
        }
      }
    }
    if (!fileSettings) {
      return Promise.reject(new Error('Preview not found'));
    }
    // let filename = fileSettings.originalname;
    // res.setHeader('Content-Type', fileSettings.mimetype);
    // res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(filename) + '"');
    // res.setHeader('Content-Length', fileSettings.size);
    // if (req.query.fileId) {
    //   res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
    // }
    // let stream = fs.createReadStream(fileSettings.path);
    // debug('stream ready');
    // stream.on('end', function() {
    //   res.status(200);
    //   debug('status sent');
    // });
    // stream.pipe(res);
    // debug('piped');
    // res.locals.fileSent = true;


    // Check if the file is readable.
    return new Promise((resolve, reject) => {
      fs.access(fileSettings.path, fs.constants.R_OK, (err) => {
        if (err) return reject(new Error('File not found'));
        res.setHeader('Content-Type', fileSettings.mimetype);
        let filename = fileSettings.originalname;
        res.setHeader('Content-Disposition', 'attachment; filename="' + encodeURIComponent(filename) + '"');
        res.setHeader('Content-Length', fileSettings.size);
        if (req.query.fileId) {
          res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
        }
        //let access = fs.accessSync(fileSettings.path);
        let stream = fs.createReadStream(fileSettings.path);
        stream.pipe(res);
        res.locals.fileSent = true;
        resolve(element);
      });

    });
  }

  post(options?: ControllerPostOptions) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      this.extendRequest(req, 'post').then(() => {
        return this.preInput(null, req, res);
      }).then(() => {
        return this.model.instanceFromRequest(req, res);
      }).then((element) => {
        return this.postElement(element, req, res);
      }).then((element) => {
        return element.insert();
      }).then((element) => {
        element.request = req;
        return this.postAfterInsert(element, req, res);
      }).then((element) => {
        if (options && options.ignoreOutput) return Promise.resolve(element);
        return element.output();
      }).then((element) => {
        return this.postOutput(element, req, res);
      }).then((element) => {
        res.locals.element = element;
        if (!options || !options.ignoreSend) res.send(element);
        else next();
      }).catch(next);
    };
  }

  postMany(options?: ControllerPostManyOptions) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      this.extendRequest(req, 'post').then(() => {
        return this.preInput(null, req, res);
      }).then(() => {
        return this.model.instanceFromRequest(req, res);
      }).then((element) => {
        return this.postElement(element, req, res);
      }).then(async (element) => {
        const quantity = await this.postManyQuantity(element, req, res, options?.quantity);
        let elements = await element.insertMany(quantity);
        elements = await Promise.all(elements.map(async (element) => {
          return await this.postAfterInsert(element, req, res);
        }));
        if (!options || !options.ignoreOutput) {
          elements = await Promise.all(elements.map(async (element) => {
            return await element.output();
          }));
        }
        elements = await Promise.all(elements.map(async (element) => {
          return await this.postOutput(element, req, res);
        }));
        res.locals.elements = elements;
        if (!options || !options.ignoreSend) res.send(elements);
        else next();
      }).catch(next);
    };
  }

  put(options?: ControllerPutOptions) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    if (!options) options = {};
    if (options.ignoreOutput === undefined) options.ignoreOutput = false;
    if (options.ignoreSend === undefined) options.ignoreSend = false;
    if (options.setUpdatePropertiesWithBodyKeys === undefined) options.setUpdatePropertiesWithBodyKeys = true;

    return (req: Request, res: Response, next: NextFunction) => {
      let getOneOptions: GetOneOptions = {};
      this.extendRequest(req, 'put').then(() => {
        return this.putElementId(req.params.elementId, req, res);
      }).then((elementId) => {
        getOneOptions.deco = this.getModelDeco(req, res);
        return this.prepareGetOneQuery(elementId, req, res, getOneOptions);
      }).then((query) => {
        return this.model.getOneWithQuery(query, getOneOptions);
      }).then((element) => {
        if (!element) return Promise.reject('Element not found');
        element.request = req;
        return this.putElement(element, req, res);
      }).then((element) => {
        return this.preInput(element, req, res);
      }).then((element) => {
        return element.updateInstanceFromRequest(req, res);
      }).then((element) => {
        let properties = undefined;
        if (options && options.setUpdatePropertiesWithBodyKeys) {
          properties = Object.keys(req.body);
        }
        return element.update(properties);
      }).then((element) => {
        element.request = req;
        return this.putAfterUpdate(element, req, res);
      }).then((element) => {
        if (options && options.ignoreOutput) return Promise.resolve(element);
        return element.output();
      }).then((element) => {
        return this.postOutput(element, req, res);
      }).then((element) => {
        res.locals.element = element;
        if (options && !options.ignoreSend) res.send(element);
        else next();
      }).catch(next);
    };
  }

  delete(options = {ignoreSend: false}) {
    if (!this.model || this.model !instanceof Model) throw new Error('Invalid Model');

    return (req: Request, res: Response, next: NextFunction) => {
      let getOneOptions: GetOneOptions = {};
      getOneOptions.deco = this.getModelDeco(req, res);
      this.extendRequest(req, 'delete').then(() => {
        return this.deleteElementId(req.params.elementId, req, res);
      }).then((elementId) => {
        return this.prepareGetOneQuery(elementId, req, res, getOneOptions);
      }).then((query) => {
        return this.model.getOneWithQuery(query, getOneOptions);
      }).then((element) => {
        if (!element) return Promise.reject('element not found');
        element.request = req;
        return this.deleteElement(element, req, res);
      }).then((element) => {
        return element.remove();
      }).then((result): any => {
        return this.deleteAfterDelete(result, req, res);
      }).then((result): any => {
        res.locals.result = result;
        if (result && !options.ignoreSend) return res.sendStatus(204);
        if (result && options.ignoreSend) return next();
        return Promise.reject(new Error('Unknown error'));
      }).catch(next);
    };
  }

  sendLocals(key: string, output: boolean | 'list' = false, model?: typeof Model) {
    return (req: Request, res: Response, next: NextFunction) => {
      let value = res.locals[key];
      if (value === undefined) return res.sendStatus(204);
      if (output === true && value.output && typeof value.output === 'function') {
        return value.output().then((value: any) => res.send(value));
      } else if (output === 'list' && model) {
        return model.outputList(value).then((value: any) => res.send(value));
      }
      return res.send(value);
    }
  }

  allowOnlyInBody(props: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
      let newBody: StringAnyMap = {};
      for (let key in req.body) {
        if (props.indexOf(key) !== -1) newBody[key] = req.body[key];
      }
      req.body = newBody;
      next();
    }
  }

  debug(message: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      debug('Controller debug', message);
      next();
    };
  }

  static getAllRoute(): string { return '/'; }
  static getOneRoute(): string { return '/:elementId'; }
  static postRoute(): string { return '/'; }
  static putRoute(): string { return '/:elementId'; }
  static deleteRoute(): string { return '/:elementId'; }

  public static preventProperties(props: Array<string>) {
    return (req: Request, res: Response, next: NextFunction) => {
      for (let prop of props) {
        if (req.body[prop]) {
          return next(new Error('Operation not permitted, editing: ' + prop));
        }
      }
      next();
    }
  }

}

export interface QueryFromReqOptions {
  searchQuery?: {$or: Array<any>};
  filterQueries?: any[];
}