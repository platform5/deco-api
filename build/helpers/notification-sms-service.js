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
const pug_1 = __importDefault(require("pug"));
const path_1 = __importDefault(require("path"));
const { SMSAPI } = require('smsapi');
class NotificationSMSService {
    constructor(accessToken, templatePath) {
        this.accessToken = accessToken;
        this.templatePath = templatePath;
    }
    send(mobile, template, data, templateSettings) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            data.cache = true;
            data.pretty = false;
            let from = 'Info';
            if (data.app && data.app.smtpConfigFromName) {
                from = data.app.smtpConfigFromName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "");
            }
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
            const apiToken = this.accessToken;
            const smsapi = new SMSAPI(apiToken);
            const targetMobile = mobile.startsWith('+') ? mobile.substring(1) : mobile;
            try {
                let result = yield smsapi.sms.sendSms(targetMobile, txt, { from });
                if (result.list && result.list.length > 0) {
                    return true;
                }
                return false;
            }
            catch (err) {
                const errorMessage = ((_a = err) === null || _a === void 0 ? void 0 : _a.message) || '';
                // Handle SSL certificate error by temporarily bypassing validation (fail-safe)
                if (errorMessage.includes('self signed certificate')) {
                    const originalRejectValue = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
                    try {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
                        // Retry with current settings but bypassing TLS validation
                        const retryResult = yield smsapi.sms.sendSms(targetMobile, txt, { from });
                        if (retryResult.list && retryResult.list.length > 0) {
                            return true;
                        }
                    }
                    catch (retryErr) {
                        // Ignore additional errors
                    }
                    finally {
                        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectValue;
                    }
                }
                // Retry with default sender 'Info' if custom 'from' might be the issue
                if (from !== 'Info') {
                    try {
                        const retryResult = yield smsapi.sms.sendSms(targetMobile, txt, { from: 'Info' });
                        if (retryResult.list && retryResult.list.length > 0) {
                            return true;
                        }
                    }
                    catch (retryErr) {
                        // Ignore additional errors
                    }
                }
                console.log(((_c = (_b = err) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || ((_d = err) === null || _d === void 0 ? void 0 : _d.message) || err);
                return false;
            }
        });
    }
}
exports.NotificationSMSService = NotificationSMSService;
let smsService = new NotificationSMSService('CPoPsSfiSe4lvUTm4kk7ibyMKWcvjCeZ7SEI1bUa', path_1.default.resolve(__dirname, '../../emails'));
exports.smsService = smsService;
//# sourceMappingURL=notification-sms-service.js.map