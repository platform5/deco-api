import { Model, ObjectId, Metadata } from '../../';
export declare class ProfileModel extends Model {
    appId: ObjectId | null;
    userId: ObjectId | null;
    picture: any;
    street: string;
    zip: string;
    city: string;
    country: string;
    company: string;
    department: string;
    metadata: Array<Metadata>;
}
//# sourceMappingURL=profile.model.d.ts.map