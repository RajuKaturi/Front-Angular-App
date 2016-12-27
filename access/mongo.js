'use strict';

const config = require('./config');
const MongoClient = require('mongodb').MongoClient;

// treat MongoDb as a singleton
const mongoDb = new MongoDb();
module.exports = mongoDb;

function MongoDb() {
  /**
   * Set with MongoDb.open(...)
   * @type {null}
   */
  this.db = null;
}

MongoDb.prototype.open = open;
MongoDb.prototype.close = close;

//////////
function close() {
  return new Promise((resolve, reject) => {
    if (!this.db) {
      Promise.resolve();
    }

    this
      .db
      .close()
      .then(resolve)
      .catch(reject);
  });
}

function open() {
  return new Promise((resolve, reject) => {
    let url = '';
    if (config && config.mongodb) {
      if (!config.mongodb.username || !config.mongodb.password) {
        url = `mongodb://${config.mongodb.url}/${config.mongodb.db}`
      } else {
        url = `mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.url}/${config.mongodb.db}`;
      }
    }

    MongoClient
      .connect(url)
      .then((db) => {
        this.db = db;
        resolve();
      })
      .catch(reject);
  });
}
