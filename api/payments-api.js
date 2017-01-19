'use strict';

const ach = require('../models/ach');
const config = require('../access/config');
const express = require('express');
const router = express.Router();
const request = require('request');
const donations = require('../models/donations');
const stripeCard = require('../models/stripe-card');
const stripeAch = require('../models/stripe-ach');


let stripe = require('stripe')(config.stripe.stripeKey);

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);
module.exports = router;

// req means request we are reciving from the front end.
// res means responce we are sending to the front end as a responce for received request.
// 200 code is for sucess- As the payment gateway & MongoDb is giving sucuess responce as 'String' .
// 400 code is for failure- As the payment gateway & MongoDb is giving failure responce as 'String'.
//Payment gateway accepting amount in cents that's why we are multiplied by 100.

function postAch(req, res) {
  console.log('This is ACH')
  let customerId;
  let paymentData = req.body;
  let paymentType = 'Bank';
  let stripeStatus;
  let stripeAchPayment = new stripeAch();

//Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({message: 'INVALID_BODY'});
  }

//Check the customer in mongodb
  donations
    .get(paymentData.email)
    .then(
      (data) => {
        if (data.length === 0) {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          customerId = data[0].customerId;
          console.log(customerId);
        }
//If customer exist
        if (stripeStatus) {
//Ach recurringPayment
          if (paymentData.status) {
//createPlan
            stripeAchPayment
              .createPlan(paymentData)
              .then((plan) => {
//createAchSubscription
                stripeAchPayment
                  .createAchSubscription(customerId, paymentData)
                  .then((subscription) => {
                    new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                      .save()
                      .then(() => {
                        return res
                          .status(200)
                          .json({message: 'succeeded'});
                      }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_WHILE_SAVING_DATA'});
                    })
                  }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_SUBSCRIPTION'});
                });
              }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          } else {
//createAchCharge
            stripeAchPayment
              .createAchCharge(customerId, paymentData)
              .then((charge) => {
//Saving the data in MongoDB
                new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                  .save()
                  .then(() => {
                    return res
                      .status(200)
                      .json({message: 'succeeded'});
                  }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_SAVING_DATA'});
                })
              }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
            });
          }
        } else {
//New customer
////Ach recurringPayment
          if (paymentData.status) {
//createPlan
            stripeAchPayment
              .createPlan(paymentData)
              .then((plan) => {
//createAchCustomer
                stripeAchPayment
                  .createAchCustomer(paymentData)
                  .then((customer) => {
//verifyCustomer
                    stripeAchPayment
                      .verifyCustomer(customer)
                      .then((bankAccount) => {
//createAchSubscription
                        stripeAchPayment.createAchSubscription(bankAccount.customer, paymentData)
                          .then((subscription) => {
//Saving the data in MongoDB
                            new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                              .save()
                              .then(() => {
                                return res
                                  .status(200)
                                  .json({message: 'succeeded'});
                              }).catch((err) => {
                              return res
                                .status(400)
                                .json({error: 'ERROR_WHILE_SAVING_DATA'});
                            })
                          }).catch((err) => {
                          return res
                            .status(400)
                            .json({error: 'ERROR_WHILE_SUBSCRIPTION'});
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
//Ach chargePayment
//createAchCustomer
            stripeAchPayment
              .createAchCustomer(paymentData)
              .then((customer) => {
//verifyCustomer
                stripeAchPayment.verifyCustomer(customer)
                  .then((bankAccount) => {
//createAchCharge
                    stripeAchPayment.createAchCharge(bankAccount.customer, paymentData)
                      .then((charge) => {
//Saving the data in MongoDB
                        new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            return res
                              .status(200)
                              .json({message: 'succeeded'});
                          }).catch((err) => {
                          return res
                            .status(400)
                            .json({error: 'ERROR_WHILE_SAVING_DATA'});
                        })
                      }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
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
  console.log('This is CARD')
  let customerId;
  let paymentData = req.body;
  let paymentType = 'Card';
  let stripeStatus;
  let stripeCardPayment = new stripeCard();

//Empty req.
  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({message: 'INVALID_BODY'});
  }

//Check the customer in MONGOdb
  donations
    .get(paymentData.email)
    .then(
      (data) => {
        if (data.length === 0) {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          customerId = data[0].customerId;
          console.log(customerId);
        }

//If customer exist
        if (stripeStatus) {
//Card recurringPayment
          if (paymentData.status) {
//createPlan
            stripeCardPayment.createPlan(paymentData)
              .then((plan) => {
//createCardSubscription
                stripeCardPayment.createCardSubscription(customerId, paymentData)
                  .then((subscription) => {
//Saving the data in MongoDB
                    new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                      .save().then(() => {
                      return res
                        .status(200)
                        .json({message: 'succeeded'});
                    }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_WHILE_SAVING_DATA'});
                    })
                  }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_SUBSCRIPTION'});
                })
              }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_SAVING_DATA'});
            })
          } else {
//createCardCharge
            stripeCardPayment
              .createCardCharge(customerId, paymentData).then((charge) => {
//Saving the data in MongoDB
              new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                .save()
                .then(() => {
                  return res
                    .status(200)
                    .json({message: 'succeeded'});
                }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
              })
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }
        } else {
//New customer
//Card recurringPayment
          if (paymentData.status) {
//createPlan
            stripeCardPayment
              .createPlan(paymentData)
              .then((plan) => {
//createCardCustomer
                stripeCardPayment
                  .createCardCustomer(paymentData)
                  .then((customer) => {
//createCardSubscription
                    stripeCardPayment
                      .createCardSubscription(customer.id, paymentData)
                      .then((subscription) => {
//Saving the data in MongoDB
                        new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            return res
                              .status(200)
                              .json({message: 'succeeded'});
                          }).catch((err) => {
                          return res
                            .status(400)
                            .json({error: 'ERROR_WHILE_SAVING_DATA'});
                        })
                      }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_WHILE_SUBSCRIPTION'});
                    })
                  }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
                });
              }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_SAVING_DATA'});
            })
          } else {
//Card chargePayment
//createCardCustomer
            stripeCardPayment
              .createCardCustomer(paymentData)
              .then((customer) => {
//createCardCharge
                stripeCardPayment
                  .createCardCharge(customer.id, paymentData)
                  .then((charge) => {
//Saving the data in MongoDB
                    new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                      .save().then(() => {
                      return res
                        .status(200)
                        .json({message: 'succeeded'});
                    }).catch((err) => {
                      return res
                        .status(400)
                        .json({error: 'ERROR_WHILE_SAVING_DATA'});
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
