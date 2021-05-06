import { Model, ObjectId } from '../../';
export declare class TemplateModel extends Model {
    appId: ObjectId | null;
    key: string;
    subject: string | {
        [key: string]: string;
    };
    html: string | {
        [key: string]: string;
    };
    text: string | {
        [key: string]: string;
    };
    sms: string | {
        [key: string]: string;
    };
}
//# sourceMappingURL=template.model.d.ts.map