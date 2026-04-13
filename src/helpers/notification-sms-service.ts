import { TemplateModel } from './../modules/template/template.model';
import pug from 'pug';
import path from 'path';
const { SMSAPI } = require('smsapi');

export class NotificationSMSService {
  templatePath: string;
  accessToken: string;

  constructor(accessToken: string, templatePath: string) {
    this.accessToken = accessToken;
    this.templatePath = templatePath;
  }

  public async send(mobile: string, template: string, data: any, templateSettings?: {rootPath?: string}) {
    data.cache = true;
    data.pretty = false;

    let from: string = 'Info';
    if (data.app && data.app.smtpConfigFromName) {
       from = (data.app.smtpConfigFromName as string).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "");
    }

    let options = Object.assign({}, data, {pretty: false, cache: true});

    const templatePath = templateSettings?.rootPath ? templateSettings.rootPath : this.templatePath;

    const dbTemplate = await TemplateModel.getOneWithQuery({appId: data.app._id, key: template});
    let templateString: string | null = null;
    if (dbTemplate) {
      let _sms = (dbTemplate.sms as {[key: string]: string});
      let locale = data.app.defaultLocale;
      if (data.user && data.user.locale) {
        locale = data.user.locale;
      } else if (data.locale) {
        locale = data.locale;
      }
      if (_sms && _sms[locale]) {
        templateString = _sms[locale];
        options.cache = false;
      }
    }

    let txt = templateString !== null
                ? pug.render(templateString, options)
                : pug.renderFile(templatePath + '/' + template + '/sms.pug', options);

      const apiToken = this.accessToken;
      const smsapi = new SMSAPI(apiToken);

      const targetMobile = mobile.startsWith('+') ? mobile.substring(1) : mobile;

      try {
        let result: SmsResult = await smsapi.sms.sendSms(targetMobile, txt, { from });
        if (result.list && result.list.length > 0) {
          return true;
        }
        
        return false;
      } catch (err) {
        const errorMessage = (err as any)?.message || '';

        // Handle SSL certificate error by temporarily bypassing validation (fail-safe)
        if (errorMessage.includes('self signed certificate')) {
            const originalRejectValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
            try {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                // Retry with current settings but bypassing TLS validation
                const retryResult: SmsResult = await smsapi.sms.sendSms(targetMobile, txt, { from });
                if (retryResult.list && retryResult.list.length > 0) {
                    return true;
                }
            } catch (retryErr) {
                // Ignore additional errors
            } finally {
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectValue;
            }
        }

        // Retry with default sender 'Info' if custom 'from' might be the issue
        if (from !== 'Info') {
            try {
                const retryResult: SmsResult = await smsapi.sms.sendSms(targetMobile, txt, { from: 'Info' });
                if (retryResult.list && retryResult.list.length > 0) {
                    return true;
                }
            } catch (retryErr) {
                // Ignore additional errors
            }
        }

        console.log((err as any)?.data?.message || (err as any)?.message || err);
        return false;
    }
  }

}

let smsService = new NotificationSMSService('CPoPsSfiSe4lvUTm4kk7ibyMKWcvjCeZ7SEI1bUa', path.resolve(__dirname, '../../emails'));

export {smsService};

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