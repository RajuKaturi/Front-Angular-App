'use strict';


const config = require('../access/config');

let stripe = require('stripe')(config.stripe.stripeKey);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

module.exports = StripeAch;

function StripeAch() {

}


StripeAch.prototype.createAchCustomer = createAchCustomer;
StripeAch.prototype.verifyCustomer = verifyCustomer;
StripeAch.prototype.createAchCharge = createAchCharge;
StripeAch.prototype.createMetaData = createMetaData;


function createAchCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    stripe
      .customers
      .create({
        source: paymentData.data.id,
        email: paymentData.email,
      })
      .then((customer) => {
        return resolve(customer);
      })
      .catch(reject);
  });

}

function verifyCustomer(customer) {
  return new Promise((resolve, reject) => {
    stripe
      .customers
      .verifySource(
        customer.id,
        customer.default_source,
        {
          amounts: [32, 45]
        })
      .then((bankAccount) => {
        return resolve(bankAccount);
      })
      .catch(reject);
  });

}

function createAchCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
      stripe
        .charges
        .create({
          amount: paymentData.amount * 100,
          currency: currency,
          customer: customerId,
          metadata: createMetaData(paymentData)
        })
      .then((charge) => {
        return resolve(charge);
      })
      .catch(reject);
  });

}

function createMetaData(paymentData) {

  let metadata = {
    userName: paymentData.data.name,
    Email: paymentData.email,
    address1: paymentData.data.address_line1,
    address2: paymentData.data.address_line2,
    city: paymentData.data.address_city,
    state: paymentData.data.address_state,
    zip: paymentData.data.address_zip,
    country: paymentData.data.address_country,
    firstName: paymentData.donorFirstName,
    lastName: paymentData.donorLastName,
    phoneNumber: paymentData.phoneNumber
  };
  return metadata;
}
