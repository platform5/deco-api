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

  public send(mobile: string, template: string, data: any, templateSettings?: {rootPath?: string}) {
    data.cache = true;
    data.pretty = false;

    let options = Object.assign({}, data, {pretty: false, cache: true});

    const templatePath = templateSettings?.rootPath ? templateSettings.rootPath : this.templatePath;

    let txt = pug.renderFile(templatePath + '/' + template + '/sms.pug', options);

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