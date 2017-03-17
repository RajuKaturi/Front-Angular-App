'use strict';

const StripeAchAccessLayer = require('../access/stripeAch');

module.exports = StripeAch;

function StripeAch() {
}

StripeAch.prototype.createAchCustomer = createAchCustomer;
StripeAch.prototype.verifyCustomer = verifyCustomer;
StripeAch.prototype.createAchCharge = createAchCharge;
StripeAch.prototype.createPlan = createPlan;
StripeAch.prototype.createAchSubscription = createAchSubscription;
StripeAch.prototype.retrieveAndUpdateCustomer = retrieveAndUpdateCustomer;
StripeAch.prototype.createSource = createSource;
StripeAch.prototype.verifyCustomerAndCharge = verifyCustomerAndCharge;

function createAchCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchCustomer(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createAchSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchSubscription(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function verifyCustomer(customer , paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .verifyCustomer(customer , paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createAchCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchCharge(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createPlan(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createPlan(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function retrieveAndUpdateCustomer(customerId) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .retrieveAndUpdateCustomer(customerId)
      .then(resolve)
      .catch(reject);
  });
}

function createSource(customerId,paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createSource(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}
function verifyCustomerAndCharge(customer,paymentData , sourceId) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .verifyCustomerAndCharge(customer, paymentData , sourceId)
      .then(resolve)
      .catch(reject);
  });
}
