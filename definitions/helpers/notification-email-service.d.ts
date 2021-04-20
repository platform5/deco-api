import { AppModel } from '../';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import Mail from 'nodemailer/lib/mailer';
import { Attachment } from 'nodemailer/lib/mailer';
export interface TemplateOverride {
    rootPath?: string;
    cssPath?: string;
    subject?: string;
    html?: string;
    text?: string;
    sms?: string;
}
export declare class NotificationEmailService {
    private transporter?;
    from?: string;
    private enablePreviewMode;
    private realySendEmail;
    static serviceForApp(app: AppModel): NotificationEmailService;
    initTransporter(options: SMTPTransport.Options | SMTPPool.Options): void;
    send(recipients: string | Mail.Address | Array<string | Mail.Address>, templatePath: string, data: any, templateOverride?: TemplateOverride | null, attachments?: Attachment[]): Promise<any>;
}
declare let emailService: NotificationEmailService;
export { emailService };
//# sourceMappingURL=notification-email-service.d.ts.map