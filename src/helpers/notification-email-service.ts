import path from 'path';
import { TemplateModel, AppModel } from '../';
import Email from 'email-templates';
import nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import Mail from 'nodemailer/lib/mailer';
import { Attachment } from 'nodemailer/lib/mailer';
import pug from 'pug';
let debug = require('debug')('app:helpers:notification:emailService');

export interface TemplateOverride {
  rootPath?: string;
  cssPath?: string;
  subject?: string;
  html?: string;
  text?: string;
  sms?: string;
}

export class NotificationEmailService {
  
  private transporter?: Transporter;
  public from?: string;
  private enablePreviewMode: boolean = false;
  private realySendEmail: boolean = true;

  static serviceForApp(app: AppModel): NotificationEmailService {
    if (!app) throw new Error('Missing app');
    if (!app.smtpConfigHost) throw new Error('SMTP Host unknown');
    if (!app.smtpConfigPort) throw new Error('SMTP Port unknown');
    if (!app.smtpConfigUser) throw new Error('SMTP User unknown');
    if (!app.smtpConfigPassword) throw new Error('SMTP Password unknown');
    if (!app.smtpConfigFromName) throw new Error('SMTP fromName unknown');
    if (!app.smtpConfigFromEmail) throw new Error('SMTP fromEmail unknown');

    let secure = (app.smtpConfigSecure) ? true : false;

    let emailService = new NotificationEmailService();
    emailService.initTransporter({
      host: app.smtpConfigHost,
      port: app.smtpConfigPort,
      secure: secure, // use SSL
      auth: {
        user: app.smtpConfigUser,
        pass: app.smtpConfigPassword
      }
    });
    emailService.from = `"${app.smtpConfigFromName}" <${app.smtpConfigFromEmail}>`;
    return emailService;
  }

  public initTransporter(options:  SMTPTransport.Options | SMTPPool.Options) {
    this.transporter = nodemailer.createTransport(options);
  }

  public send(recipients: string | Mail.Address | Array<string | Mail.Address>, templatePath: string,  data: any, templateOverride: TemplateOverride | null = null, attachments: Attachment[] = []): Promise<any> {
    if (!this.transporter) throw new Error('You must create a transporter before you can send emails');
    if (!this.from) throw new Error('You must define the from property before to send an email');

    const env = process.env.NODE_ENV || 'development';

    recipients = env === 'production' ? recipients : process.env.DEV_EMAIL_TO || '';
    const cssPath = templateOverride?.cssPath || path.join(__dirname, '../../emails/css');
    const emailPath = templateOverride?.rootPath || path.join(__dirname, '../../emails');

    let options: any = {
      message: {
        from: this.from,
        attachments
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: cssPath
        }
      },
      transport: this.transporter,
      preview: this.enablePreviewMode,
      send: this.realySendEmail,
      views: {
        root: emailPath
      },
      subjectPrefix: env === 'production' ? false : `${env}: `
    };

    let templatePromise: Promise<any> = Promise.resolve();
    let shouldOverrideTemplate = templateOverride !== null
                                  && templateOverride.subject !== undefined 
                                  && templateOverride.subject.length > 0 
                                  && templateOverride.html !== undefined 
                                  && templateOverride.html.length > 0;
    if (templatePath && data && data.app && data.app._id && !shouldOverrideTemplate) {
      let locale = data.app.defaultLocale;
      if (data.user && data.user.locale) {
        locale = data.user.locale;
      } else if (data.locale) {
        locale = data.locale;
      }
      templatePromise = TemplateModel.getOneWithQuery({appId: data.app._id, key: templatePath}).then((template) => {
        if (!template) return;
        let _subject = (template.subject as {[key: string]: string});
        let _html = (template.html as {[key: string]: string});
        let _text = (template.text as {[key: string]: string});
        if (_subject && _subject[locale]) {
          templateOverride = {
            subject: _subject[locale],
            html: _html[locale],
            text: _text[locale],
          };
          shouldOverrideTemplate = true;
        }
      });
    }
    
    return templatePromise.then(() => {
      if (shouldOverrideTemplate) {
        let _templateOverride: {subject: string, html: string, text?: string} = (templateOverride as {subject: string, html: string, text?: string});
        options.render = (view: string, locals: any): Promise<string> => {
          if (view.indexOf('/subject') !== -1 && _templateOverride.subject) {
            return new Promise((resolve, reject) => {
              const compiledFunction = pug.compile((_templateOverride.subject as string));
              let html = compiledFunction(locals);
              email.juiceResources(html).then(resolve).catch(reject);
            });
          }
          if (view.indexOf('/text') !== -1 && _templateOverride.text) {
            return new Promise((resolve, reject) => {
              const compiledFunction = pug.compile((_templateOverride.text as string));
              let html = compiledFunction(locals);
              email.juiceResources(html).then(resolve).catch(reject);
            });
          }
          if (view.indexOf('/html') !== -1) {
            return new Promise((resolve, reject) => {
              const compiledFunction = pug.compile(_templateOverride.html);
              let html = compiledFunction(locals);
              email.juiceResources(html).then(resolve).catch(reject);
            });
          }
          return Promise.resolve('');
        }
      }
  
  
      let email = new Email(options);
      return email.send({
        template: templatePath,
        message: {
          to: recipients
        },
        locals: data,
      }).then((value: any) => {
        return value;
      }).catch((error: Error) => {
        console.error(error);
        throw error;
      });
    });
  }

}

let emailService = new NotificationEmailService();
emailService.initTransporter({
  host: process.env.MAIL_HOST || '',
  port: parseInt(process.env.MAIL_PORT || '', 10) || 587,
  secure: false, // use SSL
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASSWORD || ''
  }
});
emailService.from = process.env.MAIL_FROM || '';

export { emailService };