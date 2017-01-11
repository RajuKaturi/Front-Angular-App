'use strict';

const DONATIONSDB = require('../access/donationsDb');
const OBJECTID = require('mongodb').ObjectID;

module.exports = Donations;

function Donations(init, paymentType) {
  this._id = (init._id) ? new OBJECTID(init._id) : null;
  this.pushToActOn = Boolean(init.pushToActOn || false);
  // this.pushToSalesForce = Boolean(init.pushToSalesForce || false);
  this.pushContactToSalesForce = Boolean(init.pushContactToSalesForce || false);
  this.pushDonationToSalesForce = Boolean(init.pushDonationToSalesForce || false);
  this.firstName = String(init.metadata.firstName || '');
  this.lastName = String(init.metadata.lastName || '');
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');
  this.paymentType = paymentType;
  this.responseObj = init;
}

Donations.prototype.save = save;
function save() {
  return new Promise((resolve, reject) => {
    new DONATIONSDB()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}

