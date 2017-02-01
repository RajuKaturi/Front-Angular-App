'use strict';

const ObjectId = require('mongodb').ObjectID;
const UserDb = require('../access/userDb');

module.exports = User;

function User(init) {
  this._id = (init._id) ? new ObjectId(init._id) : null;
  this.firstName = String(init.firstName || '');
  this.lastName = String(init.lastName || '');
  this.email = String(init.email || '');
  this.isLocalLeader = Boolean(init.isLocalLeader || false);
  this.pushToActOn = Boolean(init.pushToActOn || false);
  this.pushToSalesForce = Boolean(init.pushToSalesForce || false);
  this.pushToSendGrid = Boolean(init.pushToSendGrid || false);
}

User.prototype.save = save;
User.prototype.isEmailExists = isEmailExists;
User.prototype.update = update;

function save() {
  return new Promise((resolve, reject) => {
    new UserDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}

function isEmailExists() {
  return new Promise((resolve, reject) => {
    new UserDb()
      .findByEmail(this.email)
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}

function update(_id) {
  return new Promise((resolve, reject) => {
    new UserDb()
      .update(_id,this)
      .then((data) => {
        return resolve(data);
      })
      .catch((error) => {
        return reject(error);
      })

  });
}
