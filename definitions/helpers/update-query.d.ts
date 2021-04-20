export declare class UpdateQuery {
    $set: any;
    $unset: any;
    $addToSet: any;
    $push: any;
    $slice: any;
    constructor();
    private addValue;
    set(propertyOrObject: string | object, value?: any): this;
    unset(propertyOrObject: string | object, value?: any): this;
    addToSet(propertyOrObject: string | object, value?: any): this;
    push(propertyOrObject: string | object, value?: any): this;
    slice(propertyOrObject: string | object, value?: any): this;
    getInsertDocument(): any;
    getUpdateQuery(): any;
}
//# sourceMappingURL=update-query.d.ts.map