'use strict';

const CreditCardDb = require('../access/creditCardDb');

module.exports = CreditCard;

function CreditCard(init) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
  this.response = init;
}

CreditCard.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new CreditCardDb()
      .save(this.response)
      .then(resolve)
      .catch(reject);
  });
}

