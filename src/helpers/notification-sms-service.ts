import { TemplateModel } from './../modules/template/template.model';
import SMSAPI from 'smsapicom';
import pug from 'pug';
import path from 'path';

export class NotificationSMSService {
  api: any;
  templatePath: string;

  constructor(accessToken: string, templatePath: string) {
    this.api = new SMSAPI({
      oauth: {
        accessToken: accessToken
      }
    });
    this.templatePath = templatePath;
  }

  public async send(mobile: string, template: string, data: any, templateSettings?: {rootPath?: string}) {
    data.cache = true;
    data.pretty = false;

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

    return this.api.message
      .sms()
      //.from(app.name)
      .from('Info')
      .to(mobile)
      .message(txt)
      .execute() // return Promise
    .then(() => {
      return true;
    });
  }

}

let smsService = new NotificationSMSService('CPoPsSfiSe4lvUTm4kk7ibyMKWcvjCeZ7SEI1bUa', path.resolve(__dirname, '../../emails'));

export {smsService};