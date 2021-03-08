export declare class Query {
    private _queries;
    private _orderBy;
    private _limit;
    private _skip;
    constructor(query?: any | null);
    addQuery(query?: object): this;
    addQueryForKey(key: string, query?: object): this;
    orderBy(field: string, direction?: 'ASC' | 'DESC' | 'asc' | 'desc'): this;
    limit(nb: string | number | null): this;
    skip(nb: string | number | null): this;
    complete(): {
        $query: any;
        $sort: any;
    };
    print(): string;
    onlyQuery(): any;
    onlySort(): any;
    onlySkip(): number;
    onlyLimit(): number;
}
//# sourceMappingURL=query.d.ts.map