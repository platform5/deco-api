import { Model, ObjectId, Policies } from '../../';
export interface DynamicField {
    name: string;
    type: 'any' | 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'array' | 'object' | 'file' | 'files' | 'model' | 'models';
    options: any;
    required: boolean;
    filterable: 'no' | 'auto' | 'equal' | 'number' | 'text' | 'categories' | 'tags' | 'date' | 'id' | 'ids' | 'boolean';
    searchable: boolean;
    sortable: boolean;
}
export declare class DynamicConfigModel extends Model {
    appId: ObjectId | null;
    relatedToAppId: ObjectId | null;
    name: string;
    slug: string;
    isPublic: boolean;
    readingAccess: string;
    readingRoles: Array<string>;
    writingAccess: string;
    writingRoles: Array<string>;
    fields: Array<DynamicField>;
    label: string;
    enableAdminNotification: boolean;
    enableUserNotification: boolean;
    notificationType: 'email';
    notifyWhen: 'create' | 'edit' | 'delete';
    notificationAdminEmail: string;
    notificationAdminSubject: string;
    notificationAdminContentPrefix: string;
    notificationAdminContentSuffix: string;
    notificationAdminTemplate: string;
    notificationUserField: string;
    notificationUserSubject: string;
    notificationUserContentPrefix: string;
    notificationUserContentSuffix: string;
    notificationUserTemplate: string;
    policy: Policies.Policy;
}
//# sourceMappingURL=dynamicconfig.model.d.ts.map