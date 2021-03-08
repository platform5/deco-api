"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const __1 = require("../");
const email_templates_1 = __importDefault(require("email-templates"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const pug_1 = __importDefault(require("pug"));
let debug = require('debug')('app:helpers:notification:emailService');
class NotificationEmailService {
    constructor() {
        this.enablePreviewMode = false;
        this.realySendEmail = true;
    }
    static serviceForApp(app) {
        if (!app)
            throw new Error('Missing app');
        if (!app.smtpConfigHost)
            throw new Error('SMTP Host unknown');
        if (!app.smtpConfigPort)
            throw new Error('SMTP Port unknown');
        if (!app.smtpConfigUser)
            throw new Error('SMTP User unknown');
        if (!app.smtpConfigPassword)
            throw new Error('SMTP Password unknown');
        if (!app.smtpConfigFromName)
            throw new Error('SMTP fromName unknown');
        if (!app.smtpConfigFromEmail)
            throw new Error('SMTP fromEmail unknown');
        let secure = (app.smtpConfigSecure) ? true : false;
        let emailService = new NotificationEmailService();
        emailService.initTransporter({
            host: app.smtpConfigHost,
            port: app.smtpConfigPort,
            secure: secure,
            auth: {
                user: app.smtpConfigUser,
                pass: app.smtpConfigPassword
            }
        });
        emailService.from = `"${app.smtpConfigFromName}" <${app.smtpConfigFromEmail}>`;
        return emailService;
    }
    initTransporter(options) {
        this.transporter = nodemailer_1.default.createTransport(options);
    }
    send(recipients, templatePath, data, templateOverride = null, attachments = []) {
        var _a, _b;
        if (!this.transporter)
            throw new Error('You must create a transporter before you can send emails');
        if (!this.from)
            throw new Error('You must define the from property before to send an email');
        const env = process.env.NODE_ENV || 'development';
        recipients = env === 'production' ? recipients : process.env.DEV_EMAIL_TO || '';
        const cssPath = ((_a = templateOverride) === null || _a === void 0 ? void 0 : _a.cssPath) || path_1.default.join(__dirname, '../../emails/css');
        const emailPath = ((_b = templateOverride) === null || _b === void 0 ? void 0 : _b.rootPath) || path_1.default.join(__dirname, '../../emails');
        let options = {
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
        let templatePromise = Promise.resolve();
        const shouldOverrideTemplate = templateOverride && templateOverride.subject && templateOverride.html;
        if (templatePath && data && data.app && data.app._id && !shouldOverrideTemplate) {
            let locale = data.app.defaultLocale;
            if (data.user && data.user.locale) {
                locale = data.user.locale;
            }
            else if (data.locale) {
                locale = data.locale;
            }
            templatePromise = __1.TemplateModel.getOneWithQuery({ appId: data.app._id, key: templatePath }).then((template) => {
                if (!template)
                    return;
                let _subject = template.subject;
                let _html = template.html;
                let _text = template.text;
                if (_subject && _subject[locale]) {
                    templateOverride = {
                        subject: _subject[locale],
                        html: _html[locale],
                        text: _text[locale],
                    };
                }
            });
        }
        return templatePromise.then(() => {
            if (shouldOverrideTemplate) {
                let _templateOverride = templateOverride;
                options.render = (view, locals) => {
                    if (view.indexOf('/subject') !== -1 && _templateOverride.subject) {
                        return new Promise((resolve, reject) => {
                            const compiledFunction = pug_1.default.compile(_templateOverride.subject);
                            let html = compiledFunction(locals);
                            email.juiceResources(html).then(resolve).catch(reject);
                        });
                    }
                    if (view.indexOf('/text') !== -1 && _templateOverride.text) {
                        return new Promise((resolve, reject) => {
                            const compiledFunction = pug_1.default.compile(_templateOverride.text);
                            let html = compiledFunction(locals);
                            email.juiceResources(html).then(resolve).catch(reject);
                        });
                    }
                    if (view.indexOf('/html') !== -1) {
                        return new Promise((resolve, reject) => {
                            const compiledFunction = pug_1.default.compile(_templateOverride.html);
                            let html = compiledFunction(locals);
                            email.juiceResources(html).then(resolve).catch(reject);
                        });
                    }
                    return Promise.resolve('');
                };
            }
            let email = new email_templates_1.default(options);
            return email.send({
                template: templatePath,
                message: {
                    to: recipients
                },
                locals: data,
            }).then((value) => {
                return value;
            }).catch((error) => {
                console.error(error);
                throw error;
            });
        });
    }
}
exports.NotificationEmailService = NotificationEmailService;
let emailService = new NotificationEmailService();
exports.emailService = emailService;
emailService.initTransporter({
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '', 10) || 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER || '',
        pass: process.env.MAIL_PASSWORD || ''
    }
});
emailService.from = process.env.MAIL_FROM || '';
//# sourceMappingURL=notification-email-service.js.map