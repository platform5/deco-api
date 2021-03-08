import { Model, ObjectId } from '../../';
export declare class TestDecoratorsModel extends Model {
    title: string;
    value: number;
    measure?: string;
    type: string;
    colors?: Array<string>;
    tags?: Array<string>;
    date?: Date;
    image: any;
    documents: Array<any>;
    active: boolean;
    user?: ObjectId;
    orderNb?: number;
    data?: any;
    data2?: any;
}
//# sourceMappingURL=decorators.d.ts.map