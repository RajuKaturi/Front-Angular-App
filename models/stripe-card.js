'use strict';

const StripeCradAccessLayer = require('../access/stripeCard');

module.exports = StripeCard;

function StripeCard() {
}

StripeCard.prototype.createCardCustomer = createCardCustomer;
StripeCard.prototype.createCardCharge = createCardCharge;
StripeCard.prototype.createCardSubscription = createCardSubscription;
StripeCard.prototype.createPlan = createPlan;
StripeCard.prototype.retriveAndUpdateCustomer = retriveAndUpdateCustomer;

//createCardCustomer
function createCardCustomer(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createCardCustomer(paymentData)
      .then(resolve)
      .catch(reject);
  });
}

//createCardCharge
function createCardCharge(customerId, paymentData) {
  console.log(customerId)
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createCardCharge(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}


//createCardSubscription
function createCardSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createCardSubscription(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });
}

//createPlan
function createPlan(paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .createPlan(paymentData)
      .then(resolve)
      .catch(reject);
  });
}


function retriveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    new StripeCradAccessLayer()
      .retriveAndUpdateCustomer(customerId, paymentData)
      .then(resolve)
      .catch(reject);
  });

}
