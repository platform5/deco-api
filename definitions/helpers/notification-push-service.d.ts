import { PushNotificationModel, StringTMap, ObjectId, AppModel } from '../';
import PushNotifications from 'node-pushnotifications';
export interface PushConfig {
    enabled?: boolean;
    gcmId?: string;
    apnCert?: string;
    apnKey?: string;
    apnPass?: string;
    apnProduction?: boolean;
}
export declare class NotificationPushService {
    push: PushNotifications;
    appId: ObjectId;
    config: PushConfig;
    configString: string;
    lastUsageAt: Date;
    connected: boolean;
    static servicesByApp: StringTMap<NotificationPushService>;
    static pushConfigFromApp(app: AppModel): PushConfig;
    static serviceForApp(app: AppModel): NotificationPushService;
    static shutdownUnsedService(): void;
    constructor(app: AppModel);
    setConfig(pushConfig: PushConfig): void;
    bumpUsage(): void;
    disconnect(): void;
    connect(): void;
    static sendPendingNotifications(): void;
    static sendNotification(notification: PushNotificationModel): Promise<any>;
}
//# sourceMappingURL=notification-push-service.d.ts.map