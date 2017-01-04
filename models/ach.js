'use strict';

const AchDb = require('../access/achDb');

module.exports = Ach;

function Ach(init) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
  this.response = null;
  console.log("Ach  constructor...");
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');   this.responseObj = init;
  this.responseObj = init;
  this.response =this;

  console.log("Init object...", this.response);
}

Ach.prototype.save = save;

//////////
function save() {
  console.log("save ...");
  return new Promise((resolve, reject) => {
    new AchDb()
      .save(this.response)
      .then(resolve)
      .catch(reject);
  });
}
