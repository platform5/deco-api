import { MongoClient, Db, ObjectID } from 'mongodb';
let debug = require('debug')('deco-api:helpers:datastore');
export class Datastore {

  private mongoUrl: string = '';
  private mongoClient: MongoClient
  public db: Db;
  public ready: boolean = false;

  private options = {
    protocol: 'mongodb://',
    host: 'localhost',
    user: '',
    password: '',
    port: '27017',
    database: 'apideco'
  };

  init(options = {}): Datastore {
    this.options = Object.assign(this.options, options);
    let mongoUrl = this.options.protocol;
    if (this.options.user) {
      mongoUrl += this.options.user;
      if (this.options.password) {
        mongoUrl += `:${this.options.password}`;
      }
      mongoUrl += '@';
    }
    mongoUrl += `${this.options.host}:${this.options.port}/${this.options.database}`;
    //this.mongoClient = MongoClient;
    this.mongoUrl = mongoUrl;
    debug('Mongo URL', mongoUrl);
    return this;
  }

  connect(): Promise<any> {
    return MongoClient.connect(this.mongoUrl, {useUnifiedTopology: true}).then((mongoClient: MongoClient) => {
      this.mongoClient = mongoClient;
      this.db = this.mongoClient.db();
      debug('Database ready', this.db.databaseName);
      return this.db.collections().then((collections: Array<any>) => {
        debug('List of collections', collections.map(c => c.collectionName));
      }).catch((error) => {
        debug('No collections');
      }).finally(() => {
        this.ready = true;
      });
    });
  }

  isReady(): Promise<boolean> {
    if (this.ready) return Promise.resolve(true);
    let interval: any;
    return new Promise((resolve, reject) => {
      interval = setInterval(() => {
        if (this.ready) {
          clearInterval(interval);
          return resolve(true);
        }
      }, 10);
    });
  }

  close() {
    return this.mongoClient.close();
  }

  ObjectId() {
    return ObjectID;
  }

}

export let datastore = new Datastore();
export let ObjectId = ObjectID;
