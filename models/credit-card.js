'use strict';

const CreditCardDb = require('../access/creditCardDb');
const ObjectId = require('mongodb').ObjectID;

module.exports = CreditCard;

function CreditCard(init) {
  this._id = (init._id) ? new ObjectId(init._id) : null;
  this.pushToActOn = Boolean(init.pushToActOn || false);
  this.pushToSalesForce = Boolean(init.pushToSalesForce || false);
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');
  this.responseObj = init;

}

CreditCard.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new CreditCardDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}

