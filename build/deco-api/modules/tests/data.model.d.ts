import { Model, ObjectId } from '../../';
export declare class DataModel extends Model {
    appId: ObjectId | null;
    title: string;
    value: number;
    measure?: string;
    type: string;
    tags?: Array<string>;
    date?: Date;
    image: any;
    documents: Array<any>;
    active: boolean;
    user?: ObjectId;
}
//# sourceMappingURL=data.model.d.ts.map