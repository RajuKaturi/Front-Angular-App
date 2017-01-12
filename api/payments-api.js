'use strict';

const ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const crediCard = require('../models/credit-card');
const encodeKey = base64.encode(config.recurly.API_KEY);
const express = require('express');
const router = express.Router();
const request = require('request');
const mongo = require('../access/mongo');
const donations = require('../models/donations');

let stripe = require('stripe')(config.stripe.STRIPE_KEY);
let currency = config.stripe.currency;
let interval = config.stripe.interval;

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);
module.exports = router;

let paymentData;
let customerId;
let stripeStatus;
let metadata;
let paymentType;

// req means request we are reciving from the front end.
// res means responce we are sending to the front end as a responce for received request.
function postAch(req, res) {
  // 200 code is for sucess- As the payment gateway & MongoDb is giving sucuess responce as 'String' .
  // 444 code is for failure- As the payment gateway & MongoDb is giving failure responce as 'String'.
  //Payment gateway accepting amount in cents that's why we are multiplied by 100.
  //Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Bank';

  //Check the customer in MONGOdb
  mongo
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
          new donations(subscription, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
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
          new donations(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
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
                return res.send(444);
              })
            }).catch(() => {
              return res.send(444);
            })
          }
        }).catch(() => {
          return res.send(444);
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
              return res.send(444);
            })
          }).catch(() => {
            return res.send(444);
          })
        }
      }
    })
    .catch(() => {
      return res.send(444);
    })
}

// req means request we are reciving from the front end.
// res means responce we are sending to the front end as a responce for received request.
function postCreditCard(req, res) {
  // 200 code is for sucess- As the payment gateway & MongoDb is giving sucuess responce as 'String' .
  // 444 code is for failure- As the payment gateway & MongoDb is giving failure responce as 'String'.
  //Payment gateway accepting amount in cents that's why we are multiplied by 100.
  //Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Card';
  //Check the customer in MONGOdb
  mongo
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
          new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
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
          new donations(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
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
              return res.send(444);
            })
          }
        }).catch(() => {
          return res.send(444);
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
            return res.send(444);
          })
        }
      }
    })
    .catch(() => {
      return res.send(444);
    });
}
