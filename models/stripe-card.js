'use strict';


const config = require('../access/config');

let stripe = require('stripe')(config.stripe.stripeKey);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

module.exports = StripeCard;

function StripeCard() {

}

StripeCard.prototype.cardChargeforNewcustomer = cardChargeforNewcustomer;
StripeCard.prototype.createCardCharge = createCardCharge;
StripeCard.prototype.createMetaData = createMetaData;
StripeCard.prototype.createCardSubscription = createCardSubscription;
StripeCard.prototype.createPlan = createPlan;


function cardChargeforNewcustomer(paymentData) {

  return new Promise((resolve, reject) => {
    stripe.customers.create({
      email: paymentData.email,
      source: paymentData.data.id
    })
      .then((customer) => {
        stripe.charges.create({
          amount: paymentData.amount * 100,
          currency: currency,
          customer: customer.id,
          metadata: createMetaData(paymentData)
        }).then((customer) => {
          return resolve(customer);
        })
          .catch(reject);
      })
      .catch(reject);
  });
}


function createCardCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe.charges.create({
      amount: paymentData.amount * 100,
      currency: currency,
      customer: customerId,
      metadata: createMetaData(paymentData)
    }).then((customer) => {
      return resolve(customer);
    })
      .catch(reject);
  });
}


function createCardSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    console.log('2')
    stripe
      .subscriptions
      .create({
        customer: customerId,
        plan: paymentData.data.id,
        metadata: createMetaData(paymentData)
      }).then((subscription) => {
      return resolve(subscription);
    })
      // console.log(reject)
      .catch(reject);
  });
}


function createPlan(paymentData) {
  return new Promise((resolve, reject) => {

    stripe
      .plans
      .create({
        name: paymentData.email,
        id: paymentData.data.id,
        interval: interval,
        currency: currency,
        amount: paymentData.amount * 100,
      }).then((plan) => {
      return resolve(plan);
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
  console.log(metadata)
  return metadata;
}
