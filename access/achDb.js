'use strict';

const config = require('./config');
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

module.exports = AchDb;

function AchDb() {
  this.collectionName = (((config.mongodb || {}).collections || {}).ach || {}).name || 'transactions';
  this.options = (((config.mongodb || {}).collections || {}).ach || {}).options || null;
}

AchDb.prototype.save = save;

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
