import { GetOneOptions } from './../decorators/model';
import { ControllerHooksMiddleware } from './controller.hooks';
import { Model } from "../decorators";
import { ObjectId } from 'mongodb';
import { Request, Response, NextFunction } from 'express';
import { Query } from '../helpers/query';
import { Deco } from '../interfaces';
export interface RelatedModelFilterQueryConfig {
    model: typeof Model;
    deco: Deco;
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
    deco?: Deco | Promise<Deco>;
    baseQuery?: any;
    includeModelProp: Array<string>;
    fetchMultiple?: boolean;
}
export interface ControllerPutOptions {
    ignoreOutput?: boolean;
    ignoreSend?: boolean;
    setUpdatePropertiesWithBodyKeys?: boolean;
}
export declare class ControllerMiddleware extends ControllerHooksMiddleware {
    model: typeof Model;
    constructor(model: typeof Model);
    getModelDeco(req: Request, res: Response): Deco;
    static queryFromReq(req: Request, res: Response, deco: Deco, options?: QueryFromReqOptions): Promise<Query>;
    queryFromReq(req: Request, res: Response, deco?: Deco, options?: QueryFromReqOptions): Promise<Query>;
    sortQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query>;
    limitQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query>;
    searchQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco, searchQuery?: {
        $or: Array<any>;
    }): Promise<Query>;
    private prepareSearchRegexp;
    private escapeRegExp;
    addRelatedModelsFiltersInReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<void>;
    findOriginalModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>, deco?: Deco): Promise<Array<RelatedModelFilterQueryConfig>>;
    findDetectedModelRelations(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>): Promise<Array<RelatedModelFilterQueryConfig>>;
    placeRelationalFiltersInReq(req: Request, res: Response, relatedQueriesSettings: Array<RelatedModelFilterQueryConfig>, query: Query, deco?: Deco): Promise<void>;
    filterQueryFromDeco(deco: Deco, query: Query, queryProps: {
        [key: string]: any;
    }): Promise<Query>;
    filterQueryFromReq(req: Request, res: Response, query: Query, deco?: Deco): Promise<Query>;
    extendQueryBasedOnDecoPropAndValue(query: Query, deco: Deco, prop: string, filterValue: any): void;
    prepareQueryFromReq(): (req: Request, res: Response, next: NextFunction) => void;
    autoFetch(autoFetchConfigs: Array<AutoFetchConfig>, send?: boolean): (req: Request, res: Response, next: NextFunction) => Promise<void> | undefined;
    getAll(query?: Query | null, options?: ControllerGetAllOptions): (req: Request, res: Response, next: NextFunction) => void;
    prepareGetOneQuery(elementId: string | ObjectId, req: Request, res: Response, options: GetOneOptions): Promise<Query>;
    getOne(options?: ControllerGetOneOptions): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Process the query to find any downloadable files
     * ?download=image : will try to download the file placed in the image property of the model (if any)
     * By default, it will download the original file, except if the query has a preview= parameter
     * ?preview=800:600 : will try to download the smaller file that has at least 800 px width and 600 px height
     * ?preview=800 : will try to download the smaller file that has at least 800 px width
     * ?preview=:600 : will try to download the smaller file that has at least 600 px height
     * For properties of type "files", the query must also contain a "fileId" paramater, indicating which file to download from the array
     */
    processDownload(req: Request, res: Response, element: Model): Promise<Model>;
    post(options?: ControllerPostOptions): (req: Request, res: Response, next: NextFunction) => void;
    postMany(options?: ControllerPostManyOptions): (req: Request, res: Response, next: NextFunction) => void;
    put(options?: ControllerPutOptions): (req: Request, res: Response, next: NextFunction) => void;
    delete(options?: {
        ignoreSend: boolean;
    }): (req: Request, res: Response, next: NextFunction) => void;
    sendLocals(key: string, output?: boolean | 'list', model?: typeof Model): (req: Request, res: Response, next: NextFunction) => any;
    allowOnlyInBody(props: Array<string>): (req: Request, res: Response, next: NextFunction) => void;
    debug(message: string): (req: Request, res: Response, next: NextFunction) => void;
    static getAllRoute(): string;
    static getOneRoute(): string;
    static postRoute(): string;
    static putRoute(): string;
    static deleteRoute(): string;
    static preventProperties(props: Array<string>): (req: Request, res: Response, next: NextFunction) => void;
}
export interface QueryFromReqOptions {
    searchQuery?: {
        $or: Array<any>;
    };
    filterQueries?: any[];
}
//# sourceMappingURL=controller.d.ts.map