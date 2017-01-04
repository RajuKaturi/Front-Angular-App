'use strict';

const config = require('./config');
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

module.exports = AchDb;

function AchDb() {
  this.collectionName = (((config.mongodb || {}).collections || {}).Ach || {}).name || 'transactions';
  this.options = (((config.mongodb || {}).collections || {}).Ach || {}).options || null;
}

AchDb.prototype.save = save;

//////////
function save(entity) {
  console.log("save(entity)");
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
