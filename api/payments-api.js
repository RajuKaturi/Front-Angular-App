'use strict';

const Ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const CreditCard = require('../models/credit-card');
const encodedKey = base64.encode(config.recurly.API_KEY);
const express = require('express');
const router = express.Router();
const request = require('request');
const mongo = require('../access/mongo');
const Donations = require('../models/donations');

let stripe = require('stripe')(config.stripe.PUBLIC_KEY);

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);
module.exports = router;

let paymentData,
  customerId,
  stripeStatus,
  metadata,
  paymentType;

function postAch(req, res) {
  //Empty Request
  if (Object.keys(req.body).length === 0) {
    return res
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Bank';

  //Check the customer in mongodb
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
          Address1: paymentData.address1,
          Address2: paymentData.address2,
          City: paymentData.city,
          State: paymentData.state,
          Zip: paymentData.zip,
          Country: paymentData.country,
          phoneNumber: paymentData.phoneNumber,
          firstName: paymentData.fName,
          lastName: paymentData.lName
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
          new Donations(subscription, paymentType, paymentData.fName, paymentData.lName).save().then(() => {
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
          currency: 'usd',
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new Donations(charge, paymentType, paymentData.fName, paymentData.lName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
        })
      }

      //achSubscription for Exsitingcustomer
      if (paymentData.status == true) {
        let plan = stripe.plans.create({
          name: paymentData.email,
          id: paymentData.data.id,
          interval: 'day',
          currency: 'usd',
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


function postCreditCard(req, res) {
  //Empty Request
  if (Object.keys(req.body).length === 0) {
    return res
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Card';

  //Check the customer in mongodb
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
          Address1: paymentData.data.card.address_line1,
          Address2: paymentData.data.card.address_line2,
          City: paymentData.data.card.address_city,
          State: paymentData.data.card.address_state,
          Zip: paymentData.data.card.address_zip,
          Country: paymentData.data.card.address_country,
          firstName: paymentData.fName,
          lastName: paymentData.lName,
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
          new Donations(subscription, paymentType, paymentData.fName, paymentData.lName).save().then(() => {
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
          currency: 'usd',
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new Donations(charge, paymentType, paymentData.fName, paymentData.lName).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
        })
      }

      //cardSubscription for Exsitingcustomer
      if (paymentData.status == true) {
        let plan = stripe.plans.create({
          name: paymentData.email,
          id: paymentData.data.id,
          interval: 'day',
          currency: 'usd',
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
        //cardCharge for Exsitingcustomer
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
