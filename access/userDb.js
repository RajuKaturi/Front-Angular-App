'use strict';

const config = require('./config');
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

module.exports = UserDb;

function UserDb() {
  this.collectionName = (((config.mongodb || {}).collections || {}).user || {}).name || 'users';
  this.options = (((config.mongodb || {}).collections || {}).user || {}).options || null;
}

UserDb.prototype.save = save;

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
