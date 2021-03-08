export declare class NotificationSMSService {
    api: any;
    templatePath: string;
    constructor(accessToken: string, templatePath: string);
    send(mobile: string, template: string, data: any, templateSettings?: {
        rootPath?: string;
    }): any;
}
declare let smsService: NotificationSMSService;
export { smsService };
//# sourceMappingURL=notification-sms-service.d.ts.map