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
StripeAch.prototype.retriveAndUpdateCustomer = retriveAndUpdateCustomer;

//createAchCustomer
function createAchCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchCustomer(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

//createAchSubscription
function createAchSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchSubscription(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });

}

//verifyCustomer
function verifyCustomer(customer) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .verifyCustomer(customer)
      .then(resolve)
      .catch(reject);
  });
}

//createAchCharge
function createAchCharge(customerId, paymentData) {
  console.log(customerId)
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createAchCharge(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

//createPlan
function createPlan(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .createPlan(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function retriveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeAchAccessLayer()
      .retriveAndUpdateCustomer(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });

}
