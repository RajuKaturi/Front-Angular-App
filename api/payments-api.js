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

let stripe = require('stripe')(config.stripe.PUBLIC_KEY)

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

function postAch(request, response) {
  //Empty Request,//200 code is for sucess,//444 code is for failure
  if (Object.keys(request.body).length === 0) {
    return response
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = request.body;
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
          email: paymentData.email,
          address1: paymentData.address1,
          address2: paymentData.address2,
          city: paymentData.city,
          state: paymentData.state,
          zip: paymentData.zip,
          country: paymentData.country,
          phoneNumber: paymentData.phoneNumber,
          firstName: paymentData.donarFirstName,
          lastName: paymentData.donarLastName
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
          new Donations(subscription, paymentType, paymentType.donarFirstName, paymentData.donarLastName).save().then(() => {
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
          currency: 'usd',
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new Donations(charge, paymentType, paymentType.donarFirstName, paymentData.donarLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
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
  //Empty Request,//200 code is for sucess,//444 code is for failure
  if (Object.keys(request.body).length === 0) {
    return response
      .status(422)
      .json({message: 'INVALID BODY'});
  }
  paymentData = request.body;
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
          email: paymentData.email,
          address1: paymentData.data.card.address_line1,
          address2: paymentData.data.card.address_line2,
          city: paymentData.data.card.address_city,
          state: paymentData.data.card.address_state,
          zip: paymentData.data.card.address_zip,
          country: paymentData.data.card.address_country,
          firstName: paymentData.donarFirstName,
          lastName: paymentData.donarLastName,
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
          new Donations(subscription, paymentType, paymentData.donarFirstName, paymentData.donarLastName).save().then(() => {
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
          currency: 'usd',
          customer: id,
          metadata: createMetaData()
        }).then(charge => {
          new Donations(charge, paymentType, paymentType.donarFirstName, paymentData.donarLastName).save().then(() => {
            return response.send(200);
          }).catch(() => {
            return response.send(444);
          })
        }).catch(() => {
          return response.send(444);
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
              return response.send(444);
            })
          }
        }).catch(() => {
          return response.send(444);
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
            return response.send(444);
          })
        }
      }
    })
    .catch(() => {
      return response.send(444);
    });
}
