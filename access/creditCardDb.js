'use strict';

const config = require('./config');
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

module.exports = CreditCardDb;

function CreditCardDb() {
  this.collectionName = (((config.mongodb || {}).collections || {}).CreditCard || {}).name || 'transactions';
  this.options = (((config.mongodb || {}).collections || {}).CreditCard || {}).options || null;
}

CreditCardDb.prototype.save = save;

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

