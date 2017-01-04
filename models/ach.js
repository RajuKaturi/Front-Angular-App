'use strict';

const AchDb = require('../access/achDb');
const ObjectId = require('mongodb').ObjectID;

module.exports = Ach;

function Ach(init, defaultSourceForACH) {
  this._id = (init._id) ? new ObjectId(init._id) : null;
  this.pushToActOn = Boolean(init.pushToActOn || false);
  this.pushToSalesForce = Boolean(init.pushToSalesForce || false);
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');
  this.responseObj = init;
  this.defaultSourceForACH = defaultSourceForACH;
}

Ach.prototype.save = save;

//////////
function save() {
  console.log("save...",this);
  return new Promise((resolve, reject) => {
    new AchDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}
