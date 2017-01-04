'use strict';

const CreditCardDb = require('../access/creditCardDb');

module.exports = CreditCard;

function CreditCard(init) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
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

