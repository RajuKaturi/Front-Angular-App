'use strict';

const ACH = require('../models/ach');
const BASE64 = require('base-64');
const CONFIG = require('../access/config');
const CREDITCARD = require('../models/credit-card');
const ENCODEKEY = BASE64.encode(CONFIG.recurly.API_KEY);
const EXPRESS = require('express');
const ROUTER = EXPRESS.Router();
const REQUEST = require('request');
const MONGO = require('../access/mongo');
const DONATIONS = require('../models/donations');

let stripe = require('stripe')(CONFIG.stripe.STRIPE_KEY),
  currency = CONFIG.stripe.currency,
  interval = CONFIG.stripe.interval

// API for  ACH payment
ROUTER.post('/ach', postAch);
// APi for  credit card payment
ROUTER.post('/creditcard', postCreditCard);
module.exports = ROUTER;

let paymentData,
  customerId,
  stripeStatus,
  metadata,
  paymentType;

function postAch(request, response) {
  //Empty Request,
  // 200 code is for sucess,
  // 444 code is for failure,
  //Payment gateway accepting amount in cents that's why we are multiplied by 100
  if (Object.keys(request.body).length === 0) {
    return response
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = request.body;
  paymentType = 'Bank';

  //Check the customer in MONGOdb
  MONGO
    .db
    .collection('ifg_donations')
    .find({'emailId': paymentData.email}).toArray()
    .then((data) => {
      if (data == '') {
        stripeStatus = false;
      } else {
        stripeStatus = true;
        customerId = data[0].customerId;
      }
      //createMetaData
      function createMetaData() {
        metadata = {
          userName: paymentData.data.bank_account.name,
          Email: paymentData.email,
          address1: paymentData.address1,
          address2: paymentData.address2,
          city: paymentData.city,
          state: paymentData.state,
          zip: paymentData.zip,
          country: paymentData.country,
          phoneNumber: paymentData.phoneNumber,
          firstName: paymentData.donorFirstName,
          lastName: paymentData.donorLastName
        };
        return metadata;
      }

      //createAchSubscription
      function createAchSubscription(id) {
        stripe.subscriptions.create({
          customer: id,
          plan: paymentData.data.id,
          metadata: createMetaData()
        }).then(subscription => {
          new DONATIONS(subscription, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
        })
      }

      //createAchCharge
      function createAchCharge(id) {
        stripe.charges.create({
          amount: paymentData.amount * 100,
          currency: currency,
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new DONATIONS(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
        })
      }

      //achSubscription for Existingcustomer
      if (paymentData.status == true) {
        let plan = stripe.plans.create({
          name: paymentData.email,
          id: paymentData.data.id,
          interval: interval,
          currency: currency,
          amount: paymentData.amount * 100,
        }).then(plan => {
          if (stripeStatus === true) {
            createAchSubscription(customerId);
          } else {
            //achSubscription for NewCustomer
            stripe.customers.create({
              source: paymentData.data.id,
              email: paymentData.email,
            }).then(customer => {
              stripe.customers.verifySource(
                customer.id,
                customer.default_source, {
                  amounts: [32, 45]
                }).then(bankAccount => {
                createAchSubscription(bankAccount.customer);
              }).catch(() => {
                return response.send(444);
              })
            }).catch(() => {
              return response.send(444);
            })
          }
        }).catch(() => {
          return response.send(444);
        });
      } else {
        if (stripeStatus == true) {
          //achCharge for ExistingCustomer
          createAchCharge(customerId);
        } else {
          //achCharge for NewCustomer
          stripe.customers.create({
            source: paymentData.data.id,
            email: paymentData.email,
          }).then(customer => {
            stripe.customers.verifySource(
              customer.id,
              customer.default_source,
              {
                amounts: [32, 45]
              }).then(bankAccount => {
              createAchCharge(bankAccount.customer);
            }).catch(() => {
              return response.send(444);
            })
          }).catch(() => {
            return response.send(444);
          })
        }
      }
    })
    .catch(() => {
      return response.send(444);
    })
}


function postCreditCard(request, response) {
  //Empty Request,
  // 200 code is for sucess,
  // 444 code is for failure,
  //Payment gateway accepting amount in cents that's why we are multiplied by 100
  if (Object.keys(request.body).length === 0) {
    return response
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = request.body;
  paymentType = 'Card';
  //Check the customer in MONGOdb
  MONGO
    .db
    .collection('ifg_donations')
    .find({'emailId': paymentData.email}).toArray()
    .then((data) => {
      if (data == '') {
        stripeStatus = false;
      } else {
        stripeStatus = true;
        customerId = data[0].customerId;
      }

      //createMetaData
      function createMetaData() {
        metadata = {
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

      //createCardSubscription
      function createCardSubscription(id) {
        stripe.subscriptions.create({
          customer: id,
          plan: paymentData.data.id,
          metadata: createMetaData()
        }).then(subscription => {
          new DONATIONS(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
        })
      }

      //createCardCharge
      function createCardCharge(id) {
        stripe.charges.create({
          amount: paymentData.amount * 100,
          currency: currency,
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new DONATIONS(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
        })
      }

      //cardSubscription for Existingcustomer
      if (paymentData.status == true) {
        let plan = stripe.plans.create({
          name: paymentData.email,
          id: paymentData.data.id,
          interval: interval,
          currency: currency,
          amount: paymentData.amount * 100,
        }).then(plan => {
          if (stripeStatus == true) {
            createCardSubscription(customerId);
          } else {
            //cardSubscription for Newcustomer
            stripe.customers.create({
              source: paymentData.data.id,
              email: paymentData.email,
            }).then(customer => {
              createCardSubscription(customer.id);
            }).catch(() => {
              return response.send(444);
            })
          }
        }).catch(() => {
          return response.send(444);
        });
      } else {
        //cardCharge for Existingcustomer
        if (stripeStatus == true) {
          createCardCharge(customerId);
        } else {
          //cardCharge for Newcustomer
          stripe.customers.create({
            source: paymentData.data.id,
            email: paymentData.email,
          }).then(customer => {
            createCardCharge(customer.id);
          }).catch(() => {
            return response.send(444);
          })
        }
      }
    })
    .catch(() => {
      return response.send(444);
    });
}
