import cron from 'cron';
import events from 'events';
import moment from 'moment';

const CronEvents = new events.EventEmitter();

const hourlyPublish = new cron.CronJob('0 * * * *', () => {
  const h = moment().hour();
  CronEvents.emit('cron-hourly');
  CronEvents.emit(`cron-daily-${h}`);
}, null, true);

export { CronEvents }