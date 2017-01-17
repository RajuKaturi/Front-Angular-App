'use strict';

const ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const express = require('express');
const router = express.Router();
const request = require('request');
const donations = require('../models/donations');
const searchDonations = require('../models/search-donations');
const stripeCard = require('../models/stripe-card');
const stripeAch = require('../models/stripe-ach');

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);
module.exports = router;

let customerId;
let paymentData;
let paymentType;
let stripeStatus;

// req means request we are reciving from the front end.
// res means responce we are sending to the front end as a responce for received request.
// 200 code is for sucess- As the payment gateway & MongoDb is giving sucuess responce as 'String' .
// 400 code is for failure- As the payment gateway & MongoDb is giving failure responce as 'String'.
//Payment gateway accepting amount in cents that's why we are multiplied by 100.

function postAch(req, res) {
//Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Bank';

//Check the customer in mongodb
  let searchDonation = new searchDonations();
  let stripeAchPayment = new stripeAch();
  searchDonation
    .get(paymentData.email)
    .then(
      (data) => {
        if (data == '') {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          customerId = data[0].customerId;
        }
        if (stripeStatus) {
          if (paymentData.status) {
            stripeAchPayment.createPlan(paymentData).then((plan) => {
              stripeAchPayment.createAchSubscription(customerId, paymentData).then((charge) => {
                new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                  return res
                    .status(200)
                    .json({message: 'succeeded'});
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CHARGING_CUSTOMER'});
              });
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          } else {
            stripeAchPayment.createAchCharge(customerId, paymentData).then((charge) => {
              new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                return res
                  .status(200)
                  .json({message: 'succeeded'});
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_SAVING_DATA'});
              })
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
            });
          }
        } else {
          if (paymentData.status) {
            stripeAchPayment.createPlan(paymentData).then((plan) => {
              stripeAchPayment.createAchCustomer(paymentData).then((customer) => {
                stripeAchPayment.verifyCustomer(customer).then((bankAccount) => {
                  stripeAchPayment.createAchSubscription(bankAccount.customer, paymentData).then((charge) => {
                    new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                      return res
                        .status(200)
                        .json({message: 'succeeded'});
                    }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_SAVING_DATA'});
                    })
                  }).catch((err) => {
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_CHARGING_CUSTOMER'});
                  });
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_VERIFY_CUSTOMER'});
                });
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
              });
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_PLAN'});
            });
          } else {
            stripeAchPayment.createAchCustomer(paymentData).then((customer) => {
              stripeAchPayment.verifyCustomer(customer).then((bankAccount) => {
                stripeAchPayment.createAchCharge(bankAccount.customer, paymentData).then((charge) => {
                  new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                    return res
                      .status(200)
                      .json({message: 'succeeded'});
                  }).catch((err) => {
                    return res
                      .status(400)
                      .json({error: 'ERROR_SAVING_DATA'});
                  })
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_CHARGING_CUSTOMER'});
                });
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_VERIFY_CUSTOMER'});
              });
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }
        }
      })
    .catch((err) => {
      return res
        .status(400)
        .json({error: 'DATABASE ERROR'});
    })
}


function postCreditCard(req, res) {
//Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({message: 'INVALID BODY'});
  }
  paymentData = req.body;
  paymentType = 'Card';
//Check the customer in MONGOdb
  let searchDonation = new searchDonations();
  let stripeCardPayment = new stripeCard();
  searchDonation
    .get(paymentData.email)
    .then(
      (data) => {
        if (data == '') {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          customerId = data[0].customerId;
        }

        if (stripeStatus) {
          if (paymentData.status) {
            stripeCardPayment.createPlan(paymentData).then((plan) => {
              stripeCardPayment.createCardSubscription(customerId, paymentData).then((charge) => {
                new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                  return res
                    .status(200)
                    .json({message: 'succeeded'});
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_SAVING_DATA'});
              })
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_SAVING_DATA'});
            })
          } else {
            stripeCardPayment.createCardCharge(customerId, paymentData).then((charge) => {
              new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                return res
                  .status(200)
                  .json({message: 'succeeded'});
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_SAVING_DATA'});
              })
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }
        } else {
          if (paymentData.status) {
            stripeCardPayment.createPlan(paymentData).then((plan) => {
              stripeCardPayment.createCardCustomer(paymentData).then((customer) => {
                stripeCardPayment.createCardSubscription(customer.id, paymentData).then((charge) => {
                  new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                    return res
                      .status(200)
                      .json({message: 'succeeded'});
                  }).catch((err) => {
                    return res
                      .status(400)
                      .json({error: 'ERROR_SAVING_DATA'});
                  })
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
              });
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_SAVING_DATA'});
            })
          } else {
            stripeCardPayment.createCardCustomer(paymentData).then((customer) => {
              stripeCardPayment.createCardCharge(customer.id, paymentData).then((charge) => {
                new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                  return res
                    .status(200)
                    .json({message: 'succeeded'});
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
              });
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }
        }
      }).catch((err) => {
    return res
      .status(400)
      .json({error: 'DATABASE ERROR'});
  })
}
