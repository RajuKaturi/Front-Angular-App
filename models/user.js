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
}

User.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new UserDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}
