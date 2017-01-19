'use strict';

const config = require('../access/config');

let stripe = require('stripe')(config.stripe.stripeKey);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

module.exports = StripeAchAccessLayer;

function StripeAchAccessLayer() {
}

StripeAchAccessLayer.prototype.createAchCustomer = createAchCustomer;
StripeAchAccessLayer.prototype.verifyCustomer = verifyCustomer;
StripeAchAccessLayer.prototype.createAchCharge = createAchCharge;
StripeAchAccessLayer.prototype.createMetaData = createMetaData;
StripeAchAccessLayer.prototype.createPlan = createPlan;
StripeAchAccessLayer.prototype.createAchSubscription = createAchSubscription;
StripeAchAccessLayer.prototype.retriveAndUpdateCustomer = retriveAndUpdateCustomer;

//createAchCustomer
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

//createAchSubscription
function createAchSubscription(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe
      .subscriptions
      .create({
        customer: customerId,
        plan: paymentData.data.id,
        metadata: createMetaData(paymentData)
      })
      .then((subscriptions) => {
        return resolve(subscriptions);
      })
      .catch(reject);
  });

}

//verifyCustomer
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

//createAchCharge
function createAchCharge(customerId, paymentData) {
  console.log(customerId)
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
      })
      .then((plan) => {
        return resolve(plan);
      })
      .catch(reject);
  });
}

//createMetaData
function createMetaData(paymentData) {
  let metadata = {
    userName: paymentData.data.bank_account.name,
    Email: paymentData.email,
    address1: paymentData.address1,
    address2: paymentData.address2,
    city: paymentData.city,
    state: paymentData.state,
    zip: paymentData.zip,
    country: paymentData.country,
    firstName: paymentData.donorFirstName,
    lastName: paymentData.donorLastName,
    phoneNumber: paymentData.phoneNumber
  };
  return metadata;
}


//retrive Customer.
function retriveAndUpdateCustomer(customerId, paymentData) {
  return new Promise((resolve, reject) => {
    stripe
      .customers
      .retrieve(customerId, {
      })
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
