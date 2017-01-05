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

//////////
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

