'use strict';

const DonationsDb = require('../access/donationsDb');
const objectID = require('mongodb').ObjectID;

module.exports = Donations;

function Donations(init, paymentType, paymentData) {
  this._id = (init._id) ? new objectID(init._id) : null;
  this.pushToActOn = Boolean(init.pushToActOn || false);
  this.pushToSendGrid = Boolean(init.pushToSendGrid || false);
  this.pushContactToSalesForce = Boolean(init.pushContactToSalesForce || false);
  this.pushDonationToSalesForce = Boolean(init.pushDonationToSalesForce || false);
  this.firstName = String(init.metadata.firstName || paymentData.data.firstName || '');
  this.lastName = String(init.metadata.lastName || paymentData.data.lastName || '');
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.email || '');
  this.paymentType = paymentType;
  this.responseObj = init;
}

Donations.prototype.save = save;
Donations.getRecordByEmail = getRecordByEmail;

function save() {
  return new Promise((resolve, reject) => {
    new DonationsDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}

function getRecordByEmail(emailId) {
  return new Promise((resolve, reject) => {
    new DonationsDb()
      .getRecordByEmail(emailId)
      .then(resolve)
      .catch(reject);
  });
}
