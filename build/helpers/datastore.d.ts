import { Db, ObjectID } from 'mongodb';
export declare class Datastore {
    private mongoUrl;
    private mongoClient;
    db: Db;
    ready: boolean;
    private options;
    init(options?: {}): Datastore;
    connect(): Promise<any>;
    isReady(): Promise<boolean>;
    close(): Promise<void>;
    ObjectId(): typeof ObjectID;
}
export declare let datastore: Datastore;
export declare let ObjectId: typeof ObjectID;
//# sourceMappingURL=datastore.d.ts.map