import { Model, ObjectId, StringStringMap } from '../../';
export declare class TemplateModel extends Model {
    appId: ObjectId | null;
    key: string;
    subject: string | StringStringMap;
    html: string | StringStringMap;
    text: string | StringStringMap;
    sms: string | StringStringMap;
}
//# sourceMappingURL=template.model.d.ts.map