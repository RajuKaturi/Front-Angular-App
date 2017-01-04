'use strict';

const AchDb = require('../access/achDb');

module.exports = Ach;

function Ach(init, defaultSourceForACH) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
  this.customerId = String(init.customer || '');
  this.emailId = String(init.metadata.Email || '');
  this.responseObj = init;
  this.defaultSourceForACH = defaultSourceForACH;
}

Ach.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new AchDb()
      .save(this)
      .then(resolve)
      .catch(reject);
  });
}
