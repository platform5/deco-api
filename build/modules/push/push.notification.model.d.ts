import { Model, ObjectId } from '../../';
export declare class PushNotificationModel extends Model {
    appId: ObjectId;
    sentToRegIds: Array<string>;
    viewedByRegIds: Array<string>;
    openedByRegIds: Array<string>;
    title: string;
    message: string;
    collapseKey: string;
    contentAvailable: false;
    badge: false;
    custom: string;
    sendAt: Date;
    sendToTags: Array<string>;
    sent: boolean;
    sentAt: Date;
    output(includeProps?: Array<string>): Promise<any>;
}
//# sourceMappingURL=push.notification.model.d.ts.map