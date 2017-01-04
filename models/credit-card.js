'use strict';

const CreditCardDb = require('../access/creditCardDb');

module.exports = CreditCard;

function CreditCard(init) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
  this.response = null;
  console.log("CreditCard  constructor...");
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');   this.responseObj = init;
  this.responseObj = init;
  this.response =this;

  console.log("this.response object...", this.response);

}

CreditCard.prototype.save = save;

//////////
function save() {
  console.log("Before: save ");
  return new Promise((resolve, reject) => {
    new CreditCardDb()
      .save(this.response)
      .then(resolve)
      .catch(reject);
  });
}

