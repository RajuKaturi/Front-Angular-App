'use strict';

const DonationsDb = require('../access/donationsDb');
const ObjectId = require('mongodb').ObjectID;

module.exports = Donations;

function Donations(init, paymentType) {
  this._id = (init._id) ? new ObjectId(init._id) : null;
  this.pushToActOn = Boolean(init.pushToActOn || false);
  this.pushToSalesForce = Boolean(init.pushToSalesForce || false);
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');
  this.paymentType = paymentType;
  this.responseObj = init;

}

Donations.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new DonationsDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}

