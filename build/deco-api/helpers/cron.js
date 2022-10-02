"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronEvents = void 0;
const cron_1 = __importDefault(require("cron"));
const events_1 = __importDefault(require("events"));
const moment_1 = __importDefault(require("moment"));
const CronEvents = new events_1.default.EventEmitter();
exports.CronEvents = CronEvents;
const hourlyPublish = new cron_1.default.CronJob('0 * * * *', () => {
    const h = moment_1.default().hour();
    CronEvents.emit('cron-hourly');
    CronEvents.emit(`cron-daily-${h}`);
}, null, true);
//# sourceMappingURL=cron.js.map