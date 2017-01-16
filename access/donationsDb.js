'use strict';

const config = require('./config');
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

module.exports = DonationsDb;

function DonationsDb() {
  this.collectionName = (((config.mongodb || {}).collections || {}).donations || {}).name || 'transactions';
  this.options = (((config.mongodb || {}).collections || {}).donations || {}).options || null;
}

DonationsDb.prototype.save = save;
DonationsDb.prototype.get = get;

function save(entity) {
  return new Promise((resolve, reject) => {
    entity._id = new ObjectId();
    mongo
      .db
      .collection(this.collectionName)
      .insertOne(entity, this.options)
      .then(() => {
        resolve(entity);
      })
      .catch(reject);
  });
}

function get(emailId) {
  return new Promise((resolve, reject) => {
    mongo
      .db
      .collection(this.collectionName)
      .find({emailId:emailId}).toArray()
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}
