declare type MongoIndexDirection = -1 | 1;
interface MongoIndexOptions {
    type?: 'single' | 'compound' | '2dsphere';
    direction?: -1 | 1;
    compoundFields?: {
        [key: string]: MongoIndexDirection;
    };
    unique?: boolean;
    sparse?: boolean;
    partialFilterExpression?: any;
    expireAfterSeconds?: number | undefined;
}
interface MongoCollectionIndexOptions {
    type: 'text';
    properties?: Array<string>;
}
declare let index: (options?: MongoIndexOptions) => any;
export declare const collectionIndex: (options: MongoCollectionIndexOptions) => (target: any) => void;
export { index, MongoIndexOptions };
//# sourceMappingURL=mongo.d.ts.map