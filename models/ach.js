'use strict';

const AchDb = require('../access/achDb');

module.exports = Ach;

function Ach(init) {
  // this response comes back from Stripe
  // so we're just going to trust it and dump it in the DB as is
  this.response = init;
}

Ach.prototype.save = save;

//////////
function save() {
  return new Promise((resolve, reject) => {
    new AchDb()
      .save(this.response)
      .then(resolve)
      .catch(reject);
  });
}
