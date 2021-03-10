"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectId = exports.datastore = exports.Datastore = void 0;
const mongodb_1 = require("mongodb");
let debug = require('debug')('deco-api:helpers:datastore');
class Datastore {
    constructor() {
        this.mongoUrl = '';
        this.ready = false;
        this.options = {
            protocol: 'mongodb://',
            host: 'localhost',
            user: '',
            password: '',
            port: '27017',
            database: 'apideco'
        };
    }
    init(options = {}) {
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
    connect() {
        return mongodb_1.MongoClient.connect(this.mongoUrl, { useUnifiedTopology: true }).then((mongoClient) => {
            this.mongoClient = mongoClient;
            this.db = this.mongoClient.db();
            debug('Database ready', this.db.databaseName);
            return this.db.collections().then((collections) => {
                debug('List of collections', collections.map(c => c.collectionName));
            }).catch((error) => {
                debug('No collections');
            }).finally(() => {
                this.ready = true;
            });
        });
    }
    isReady() {
        if (this.ready)
            return Promise.resolve(true);
        let interval;
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
        return mongodb_1.ObjectID;
    }
}
exports.Datastore = Datastore;
exports.datastore = new Datastore();
exports.ObjectId = mongodb_1.ObjectID;
//# sourceMappingURL=datastore.js.map