"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.NotificationSMSService = void 0;
const template_model_1 = require("./../modules/template/template.model");
const smsapi_1 = __importDefault(require("smsapi"));
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
class NotificationSMSService {
    constructor(accessToken, templatePath) {
        this.api = new smsapi_1.default({
            oauth: {
                accessToken: accessToken
            }
        });
        this.templatePath = templatePath;
    }
    send(mobile, template, data, templateSettings) {
        return __awaiter(this, void 0, void 0, function* () {
            data.cache = true;
            data.pretty = false;
            let options = Object.assign({}, data, { pretty: false, cache: true });
            const templatePath = (templateSettings === null || templateSettings === void 0 ? void 0 : templateSettings.rootPath) ? templateSettings.rootPath : this.templatePath;
            const dbTemplate = yield template_model_1.TemplateModel.getOneWithQuery({ appId: data.app._id, key: template });
            let templateString = null;
            if (dbTemplate) {
                let _sms = dbTemplate.sms;
                let locale = data.app.defaultLocale;
                if (data.user && data.user.locale) {
                    locale = data.user.locale;
                }
                else if (data.locale) {
                    locale = data.locale;
                }
                if (_sms && _sms[locale]) {
                    templateString = _sms[locale];
                    options.cache = false;
                }
            }
            let txt = templateString !== null
                ? pug_1.default.render(templateString, options)
                : pug_1.default.renderFile(templatePath + '/' + template + '/sms.pug', options);
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
        });
    }
}
exports.NotificationSMSService = NotificationSMSService;
let smsService = new NotificationSMSService('CPoPsSfiSe4lvUTm4kk7ibyMKWcvjCeZ7SEI1bUa', path_1.default.resolve(__dirname, '../../emails'));
exports.smsService = smsService;
//# sourceMappingURL=notification-sms-service.js.map