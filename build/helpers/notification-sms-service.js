"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const smsapicom_1 = __importDefault(require("smsapicom"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
class NotificationSMSService {
    constructor(accessToken, templatePath) {
        this.api = new smsapicom_1.default({
            oauth: {
                accessToken: accessToken
            }
        });
        this.templatePath = templatePath;
    }
    send(mobile, template, data, templateSettings) {
        var _a;
        data.cache = true;
        data.pretty = false;
        let options = Object.assign({}, data, { pretty: false, cache: true });
        const templatePath = ((_a = templateSettings) === null || _a === void 0 ? void 0 : _a.rootPath) ? templateSettings.rootPath : this.templatePath;
        let txt = pug_1.default.renderFile(templatePath + '/' + template + '/sms.pug', options);
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
exports.NotificationSMSService = NotificationSMSService;
let smsService = new NotificationSMSService('CPoPsSfiSe4lvUTm4kk7ibyMKWcvjCeZ7SEI1bUa', path_1.default.resolve(__dirname, '../../emails'));
exports.smsService = smsService;
//# sourceMappingURL=notification-sms-service.js.map