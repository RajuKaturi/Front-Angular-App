'use strict';

const config = require('../access/config');

let stripe = require('stripe')(config.stripe.stripeKey);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

module.exports = StripeCard;

function StripeCard() {
}

StripeCard.prototype.createCardCustomer = createCardCustomer;
StripeCard.prototype.createCardCharge = createCardCharge;
StripeCard.prototype.createMetaData = createMetaData;
StripeCard.prototype.createCardSubscription = createCardSubscription;
StripeCard.prototype.createPlan = createPlan;

//createCardCustomer
function createCardCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    stripe.customers.create({
      email: paymentData.email,
      source: paymentData.data.id
    }).then((customer) => {
      return resolve(customer);
    }).catch(reject);
  });
}

//createCardCharge
function createCardCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe.charges.create({
      amount: paymentData.amount * 100,
      currency: currency,
      customer: customerId,
      metadata: createMetaData(paymentData)
    }).then((customer) => {
      return resolve(customer);
    }).catch(reject);
  });
}

//createCardSubscription
function createCardSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe
      .subscriptions
      .create({
        customer: customerId,
        plan: paymentData.data.id,
        metadata: createMetaData(paymentData)
      }).then((subscription) => {
      return resolve(subscription);
    }).catch(reject);
  });
}

//createPlan
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
    }).catch(reject);
  });
}

//createMetaData
function createMetaData(paymentData) {
  let metadata = {
    userName: paymentData.data.card.name,
    Email: paymentData.email,
    address1: paymentData.data.card.address_line1,
    address2: paymentData.data.card.address_line2,
    city: paymentData.data.card.address_city,
    state: paymentData.data.card.address_state,
    zip: paymentData.data.card.address_zip,
    country: paymentData.data.card.address_country,
    firstName: paymentData.donorFirstName,
    lastName: paymentData.donorLastName,
    phoneNumber: paymentData.phoneNumber
  };
  return metadata;
}
