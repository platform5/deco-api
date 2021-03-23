import { UpdateQuery } from './../helpers/update-query';
import { Query } from './../helpers/query';
import { Db, ObjectId, Cursor, AggregationCursor } from 'mongodb';
import { Request, Response } from 'express';
import { Deco } from '../interfaces/deco';
export declare type ModelOperation = 'getAll' | 'getOne' | 'post' | 'put' | 'delete';
export interface ModelOptions {
    acceptOtherFields?: boolean;
    enableStory?: boolean;
    modelName?: string;
}
export interface GetAllOptions {
    deco?: Deco;
    addCountInKey?: string;
}
export interface GetOneOptions {
    deco?: Deco;
}
export interface InstanceFromDocumentOptions {
    deco?: Deco;
    keepCopyOriginalValues?: boolean;
}
export declare const model: (collectionName: string, options?: ModelOptions) => (target: any) => void;
export declare class Model {
    static collectionName: string;
    static db: Db;
    static options: ModelOptions;
    model?: typeof Model;
    request: Request;
    response: Response;
    _id: ObjectId;
    _createdAt: Date;
    _updatedAt: Date;
    _createdBy: ObjectId;
    _updatedBy: ObjectId;
    filesToRemove: Array<string>;
    private _refLocales?;
    private _deco;
    static get deco(): Deco;
    get deco(): Deco;
    static getDecoProperties(deco: Deco, type?: string | Array<string>): string[];
    static getAll<T extends typeof Model>(this: T, query?: Query | null, options?: GetAllOptions): Promise<Array<InstanceType<T>>>;
    static getAllCursorAndcount(query: Query, deco: Deco): Promise<{
        cursor: Cursor<any> | AggregationCursor<any>;
        count: number;
    }>;
    static getOneWithId<T extends typeof Model>(this: T, id: string | ObjectId, options?: GetOneOptions): Promise<InstanceType<T> | null>;
    static getOneWithQuery<T extends typeof Model>(this: T, query?: Query | any, options?: GetOneOptions): Promise<InstanceType<T> | null>;
    getAgain<T extends Model>(this: T): Promise<T | null>;
    insert(): Promise<any>;
    insertMany(quantity?: number): Promise<any[]>;
    insertWithDocument<T extends Model>(this: T): Promise<T>;
    update<T extends Model>(this: T, properties?: Array<string>): Promise<T>;
    /**
     * Compare the element that was retrieve from the database
     * and only update keys that have been changed since
     */
    smartUpdate<T extends Model>(this: T): Promise<T>;
    remove(): Promise<boolean>;
    validate(properties?: Array<string>): Promise<boolean>;
    toDocument(operation: 'insert' | 'update' | 'upsert', properties?: Array<string>): Promise<UpdateQuery>;
    output(includeProps?: Array<string>, ignoreIO?: boolean, includeExtraKeys?: Array<string>): Promise<any>;
    static outputList(elements: Array<Model>, includeProps?: Array<string>, ignoreIO?: boolean, includeExtraKeys?: Array<string>): Promise<Array<any>>;
    static instanceFromDocument<T extends typeof Model>(this: T, document: any, options?: InstanceFromDocumentOptions): Promise<InstanceType<T>>;
    static decoFromRequest(req: Request, res: Response): Deco;
    decoFromRequest(req: Request, res: Response): Deco;
    static instanceFromRequest<T extends typeof Model>(this: T, req: Request, res: Response): Promise<InstanceType<T>>;
    updateInstanceFromRequest<T extends Model>(this: T, req: Request, res: Response): Promise<T>;
    get(propertyName: string): any;
    set(propertyName: string, value: any): void;
    canGetOne(options?: any): Promise<boolean>;
    canInsert(options?: any): Promise<boolean>;
    canUpdate(options?: any): Promise<boolean>;
    canRemove(options?: any): Promise<boolean>;
}
//# sourceMappingURL=model.d.ts.map