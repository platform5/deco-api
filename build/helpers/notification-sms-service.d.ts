export declare class NotificationSMSService {
    templatePath: string;
    accessToken: string;
    constructor(accessToken: string, templatePath: string);
    send(mobile: string, template: string, data: any, templateSettings?: {
        rootPath?: string;
    }): Promise<boolean>;
}
declare let smsService: NotificationSMSService;
export { smsService };
export interface List {
    id: string;
    points: number;
    number: string;
    dateSent: Date;
    submittedNumber: string;
    status: string;
    error?: any;
    idx?: any;
    parts: number;
}
export interface SmsResult {
    count: number;
    list: List[];
    message: string;
    length: number;
    parts: string;
}
//# sourceMappingURL=notification-sms-service.d.ts.map