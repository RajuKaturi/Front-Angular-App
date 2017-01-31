'use strict';

const StripeCardAccessLayer = require('../access/stripeCard');

module.exports = StripeCard;

function StripeCard() {
}

StripeCard.prototype.createCardCustomer = createCardCustomer;
StripeCard.prototype.createCardCharge = createCardCharge;
StripeCard.prototype.createCardSubscription = createCardSubscription;
StripeCard.prototype.createPlan = createPlan;
StripeCard.prototype.retrieveAndUpdateCustomer = retrieveAndUpdateCustomer;

function createCardCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCardAccessLayer()
      .createCardCustomer(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createCardCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCardAccessLayer()
      .createCardCharge(customerId, paymentData )
      .then(resolve)
      .catch(reject);
  });
}

function createCardSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCardAccessLayer()
      .createCardSubscription(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createPlan(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCardAccessLayer()
      .createPlan(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function retrieveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCardAccessLayer()
      .retrieveAndUpdateCustomer(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}
