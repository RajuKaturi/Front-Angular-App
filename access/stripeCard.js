'use strict';

const config = require('../access/config');

let stripe = require('stripe')(config.stripe.stripeKey);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

module.exports = StripeCradAccessLayer;

function StripeCradAccessLayer() {
}

StripeCradAccessLayer.prototype.createCardCustomer = createCardCustomer;
StripeCradAccessLayer.prototype.createCardCharge = createCardCharge;
StripeCradAccessLayer.prototype.createMetaData = createMetaData;
StripeCradAccessLayer.prototype.createCardSubscription = createCardSubscription;
StripeCradAccessLayer.prototype.createPlan = createPlan;
StripeCradAccessLayer.prototype.retrieveAndUpdateCustomer = retrieveAndUpdateCustomer;

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

function createMetaData(paymentData) {
  let metadata = {
    userName: paymentData.data.card.name,
    email: paymentData.email,
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

function retrieveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe
      .customers
      .retrieve(customerId, {})
      .then((customer) => {
        stripe
          .customers
          .update(customer.id, {
            source: paymentData.data.id
          })
          .then((customer) => {
            return resolve(customer);
          })
          .catch(reject);
      })
      .catch(reject);
  });
}
