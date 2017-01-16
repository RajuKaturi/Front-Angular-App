'use strict';

const donationsDb = require('../access/donationsDb');

module.exports = searchDonations;

function searchDonations() {

}

searchDonations.prototype.get = get;

function get(emailId) {
  return new Promise((resolve, reject) => {
    new donationsDb()
      .get(emailId)
      .then((data) => {
        return resolve(data);
      })
      .catch(reject);
  });
}
