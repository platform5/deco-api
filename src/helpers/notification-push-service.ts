import { PushPlayerModel, PushNotificationModel, StringTMap, Query, ObjectId, AppModel } from '../';
import PushNotifications from 'node-pushnotifications';
import moment from 'moment';
let debug = require('debug')('app:helpers:notification-push-service');

export interface PushConfig {
  enabled?: boolean;
  gcmId?: string;
  apnCert?: string;
  apnKey?: string;
  apnPass?: string;
  apnProduction?: boolean;
}

export class NotificationPushService {

  push: PushNotifications;
  appId: ObjectId;
  config: PushConfig;
  configString: string;
  lastUsageAt: Date;
  connected: boolean = false;

  static servicesByApp: StringTMap<NotificationPushService> = {};

  static pushConfigFromApp(app: AppModel): PushConfig {
    let pushConfig: PushConfig = {
      enabled: app.pushEnabled,
      gcmId: app.pushGmId,
      apnCert: app.pushApnCert,
      apnKey: app.pushApnKey,
      apnPass: app.pushApnPass,
      apnProduction: app.pushApnProduction
    }
    return pushConfig;
  }

  static serviceForApp(app: AppModel): NotificationPushService {
    if (!app) throw new Error('Missing app');
    let pushConfig = NotificationPushService.pushConfigFromApp(app);

    let configString = JSON.stringify(pushConfig);
    let appIdString = app._id.toString();
    let instance:NotificationPushService = NotificationPushService.servicesByApp[appIdString];
    if (instance && instance.configString === configString) {
      instance.bumpUsage();
      return instance;
    } else if (instance && instance.configString !== configString) {
      instance.disconnect();
      instance.setConfig(pushConfig);
      return instance;
    }
    let pushService = new NotificationPushService(app);
    return pushService;
  }

  static shutdownUnsedService() {
    for (let appId of Object.keys(NotificationPushService.servicesByApp)) {
      let instance = NotificationPushService.servicesByApp[appId];
      if (instance.connected && moment(instance.lastUsageAt).isBefore(moment().subtract(5, 'minutes'))) {
        instance.disconnect();
        delete NotificationPushService.servicesByApp[appId];
      }
    }
  }

  constructor(app: AppModel) {
    if (!app) throw new Error('Missing app');
    debug('Instantiate service for app', app.name, app._id);

    let pushConfig = NotificationPushService.pushConfigFromApp(app);
    let appIdString = app._id.toString();
    let instance:NotificationPushService = NotificationPushService.servicesByApp[appIdString];
    if (instance) throw new Error('Operation not permitted: instance already exists. Use NotificationPushService.serviceForApp() to get the NotificationPushService instance.')
    this.appId = app._id;
    this.setConfig(pushConfig);
    this.connect();
    NotificationPushService.servicesByApp[appIdString] = this;
  }

  setConfig(pushConfig: PushConfig) {
    this.config = pushConfig;
  }

  bumpUsage() {
    debug('bumpUsage for', this.appId);
    this.lastUsageAt = moment().toDate();
  }

  disconnect() {
    debug('disconnect', this.appId);
    (this.push as any).apn.shutdown();
    this.connected = false;
  }

  connect() {
    debug('connect', this.appId);
    let settings: PushNotifications.Settings = {};
    if (!this.config.enabled) throw new Error('Push is not enabled for this app');
    if (this.config.apnCert && this.config.apnKey) {
      settings.apn = {
        cert: this.config.apnCert,
        key: this.config.apnKey,
        passphrase: this.config.apnPass,
        production: this.config.apnProduction
      }
    }
    if (this.config.gcmId) {
      settings.gcm = {
        id: this.config.gcmId
      };
      (settings as any).gcm.phonegap = true;
    }
    this.push = new PushNotifications(settings);
    this.bumpUsage();
    this.connected = true;
  }

  static sendPendingNotifications() {
    let query = new Query();
    query.addQuery({sent: false});
    query.addQuery({$or: [
      {sendAt: {$lte: moment().toDate()}},
      {sendAt: null}
    ]});
    PushNotificationModel.getAll(query).then((notifications) => {
      let promises: Array<Promise<any>> = [];
      for (let notification of notifications) {
        promises.push(NotificationPushService.sendNotification(notification));
      }
    });
  }

  static sendNotification(notification: PushNotificationModel): Promise<any> {
    let push: NotificationPushService;
    let app: AppModel;
    return AppModel.getOneWithId(notification.appId).then((a) => {
      if (!a) throw new Error('App Not Found');
      app = a;
      push = NotificationPushService.serviceForApp(app);
      let playerQuery = new Query();
      playerQuery.addQuery({appId: notification.appId, active: true});
      if (notification.sendToTags && notification.sendToTags.length) {
        playerQuery.addQuery({tags: {$in: notification.sendToTags}});
      }
      return PushPlayerModel.getAll(playerQuery);
    }).then((players) => {
      let regIds = players.map(i => i.regId);
      let data:PushNotifications.Data = {
        title: notification.title,
        body: notification.message,
        topic: app.pushTopic,
      };
      if (notification.collapseKey) {
        data.collapseKey = notification.collapseKey;
      }
      if (notification.contentAvailable) {
        data.contentAvailable = notification.contentAvailable;
      }
      if (notification.badge) {
        data.badge = notification.badge;
      }
      if (notification.custom) {
        try {
          let custom = JSON.parse(notification.custom);
          data.custom = custom;
        } catch (error) {
          (data.custom as any) = {data: notification.custom};
        }
      } else {
        data.custom = {};
      }
      (data.custom as any).notId = notification._id.toString();
      return push.push.send(regIds, data)
        .then((results) => {
          let successRegId: Array<string> = [];
          for (let result of results) {
            for (let message of result.message) {
              let tmp = message.regId;
              let regId: string;
              if (typeof tmp === 'string') {
                regId = tmp;
              } else {
                regId = (tmp as any).device;
              }
              debug('regId', regId);
              if (message.error === null) {
                debug('-> sent ok');
                successRegId.push(regId);
              } else if (message.error instanceof Error) {
                debug('-> sent error');
                if (message.error.message === 'InvalidRegistration' || message.error.message === 'BadDeviceToken') {
                  debug('-> make player inactive', regId);
                  PushPlayerModel.getOneWithQuery({regId: regId}).then((p) => {
                    if (p) {
                      p.active = false;
                      p.update(['active']);
                    };
                  })
                } else {
                  debug('-> error message', message.error.message);
                  debug('message', message);
                }
              }
            }
          }

          notification.sentToRegIds = successRegId;
          notification.sent = true;
          notification.sentAt = moment().toDate();
          return notification.update(['sent', 'sentAt', 'sentToRegIds']);
        }).catch((error: any) => { 
          debug('send error', error);
        });
    });
    
  }

}

setInterval(() => {
  NotificationPushService.shutdownUnsedService();
}, 1000 * 60 * 30);

// setInterval(() => {
//   NotificationPushService.sendPendingNotifications();
// }, 1000 * 5);


// let deviceIDs = [
//   'd6187479b7b08de810b0e7313c06a1cb0f359eb3651b64e0d2e8de72a518633e',
//   //'d4wCeIjxqoE:APA91bEbF06Uv-lbIMpbXd1Aflsx-bVzrilp11vzq5UP5JZA-vTrg0XL9OIe9x5KDMJ39MbW97mt75u0epjcEDyE-hmEk15NSCkTXtlHvzf7naRoqTfF4rLy9XO0HBAysXyOIpTPSbSW'
// ];
// let data: PushNotifications.Data = {
//   title: 'Not title',
//   body: 'Not body',
//   topic: 'com.icfneuchatel.app',
//   alert: {
//     title: 'Alert title',
//     body: 'Alert body'
//   }
// };

// setTimeout(() => {
//   debug('Testing Service');
//   let app: AppModel;
//   AppModel.getOneWithId('5ce2b0ca3df63c72f3ece709').then((a) => {
//     if (!a) throw new Error('App Not Found');
//     app = a;
//     let push = NotificationPushService.serviceForApp(app)
//     debug('got push service', push);

//     setTimeout(() => {
//       debug('sending a notification');
//       push.push.send(deviceIDs, data)
//         .then((results: any) => {
//           debug('send results', results);
//           debug('results[0]', results[0]);
//         }).catch((error: any) => { 
//           debug('send error', error);
//         });
//     }, 2000);


//     setTimeout(() => {
//       push.disconnect();
//       debug('service disconnected');
//     }, 20000);
//   }).catch((error) => {
//     debug('error', error);
//   });
// }, 2000);