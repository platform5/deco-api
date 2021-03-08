import { Model, Query } from '../';
export interface TagCount {
    tag: string;
    count: number;
}
export declare class ModelHelper {
    static fetchTags(model: typeof Model, query: Query, order?: 'alpha' | 'count'): Promise<Array<TagCount>>;
}
//# sourceMappingURL=model.helper.d.ts.map