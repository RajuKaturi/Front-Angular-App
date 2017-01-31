'use strict';

const StripeCradAccessLayer = require('../access/stripeCard');

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
    new StripeCradAccessLayer()
      .createCardCustomer(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createCardCharge(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createCardCharge(customerId, paymentData )
      .then(resolve)
      .catch(reject);
  });
}

function createCardSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createCardSubscription(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function createPlan(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createPlan(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

function retrieveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .retrieveAndUpdateCustomer(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}
