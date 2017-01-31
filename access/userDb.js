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
UserDb.prototype.update = update;
UserDb.prototype.findAll = findAll;
UserDb.prototype.findById = findById;
UserDb.prototype.findByEmail = findByEmail;

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

/////////
function update(_id,entity) {
  return new Promise((resolve, reject) => {
    mongo
      .db
      .collection(this.collectionName)
      .update(
        { "_id" : ObjectId(_id)},
        { "$set":
            { "firstName": entity.firstName,
              "lastName": entity.lastName,
              "email": entity.email,
              "isLocalLeader": entity.isLocalLeader,
              "pushToActOn": entity.pushToActOn,
              "pushToSalesForce": entity.pushToSalesForce
            }
        }
      )
      .then((data) => {
        return resolve(data);
      })
      .catch((error) => {
        return reject(error);
      });
  });
}

//////////
function findById(_id){
  return new Promise((resolve, reject) => {
    mongo
      .db
      .collection(this.collectionName)
      .find({"_id": _id})
      .toArray()
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}

//////////
function findByEmail(email){
  return new Promise((resolve, reject) => {
    mongo
      .db
      .collection(this.collectionName)
      .find({"email": email})
      .toArray()
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}

//////////
function findAll(){
  return new Promise((resolve, reject) => {
    mongo
      .db
      .collection(this.collectionName)
      .find({})
      .toArray()
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}
