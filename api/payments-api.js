'use strict';

const donations = require('../models/donations');
const express = require('express');
const log = require('../access/log');
const request = require('request');
const router = express.Router();
const stripeAch = require('../models/stripe-ach');
const stripeCard = require('../models/stripe-card');

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);

module.exports = router;

// req means request we are reciving from the front end.
// res means responce we are sending to the front end as a responce for received request.
// 200 code is for sucess- As the payment gateway & MongoDb is giving sucuess responce as 'String' .
// 400 code is for failure- As the payment gateway & MongoDb is giving failure responce as 'String'.

function postAch(req, res) {
  let customerId;
  let paymentData = req.body;
  let paymentType = 'Bank';
  let stripeStatus;
  let stripeAchPayment = new stripeAch();

  //Empty req.
  if (Object.keys(req.body).length === 0) {
    log.info(`INVALID_BODY: ${JSON.parse(req.body)}`);

    return res
      .status(400)
      .json({message: 'INVALID_BODY'});
  }

  //Check the customer in mongodb
  donations
    .getRecordByEmail(paymentData.email)
    .then(
      (data) => {
        if (data.length === 0) {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          if (data[0].customerId !== '') {
            customerId = data[0].customerId;
          } else {
            winston.info('ERROR_WHILE_CHEKING_CUSTOMERID');
            return res
              .status(400)
              .json({error: 'ERROR_WHILE_CHEKING_CUSTOMERID'});
          }
        }

        //If customer exist
        if (stripeStatus) {
          //Ach recurringPayment
          if (paymentData.status) {
            stripeAchPayment
              .retrieveAndUpdateCustomer(customerId, paymentData)
              .then((retrieveAndUpdateCustomer) => {
                stripeAchPayment
                  .createPlan(paymentData)
                  .then((plan) => {
                    stripeAchPayment
                      .verifyCustomer(retrieveAndUpdateCustomer)
                      .then((bankAccount) => {
                        stripeAchPayment
                          .createAchSubscription(customerId, paymentData)
                          .then((subscription) => {
                            new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                              .save()
                              .then(() => {
                                log.info('EXISTING_CUSTOMER_ACH_RECURRING_SUCCESS');
                                return res
                                  .status(200)
                                  .json({message: 'EXISTING_CUSTOMER_ACH_RECURRING_SUCCESS'});
                              })
                              .catch((err) => {
                                log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_SAVING_DATA');
                                return res
                                  .status(400)
                                  .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_SAVING_DATA'});
                              });
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_SUBSCRIPTION');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_SUBSCRIPTION'});
                          });
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_VERIFYING_CUSTOMER');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_VERIFYING_CUSTOMER'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_CREATING_PLAN');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_CREATING_PLAN'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_RETRIEVE_UPDATE_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_RECURRING_RETRIEVE_UPDATE_CUSTOMER'});
              });
          } else {
            //Ach chargePayment
            stripeAchPayment
              .retrieveAndUpdateCustomer(customerId, paymentData)
              .then((retrieveAndUpdateCustomer) => {
                stripeAchPayment
                  .verifyCustomer(retrieveAndUpdateCustomer)
                  .then((bankAccount) => {
                    stripeAchPayment
                      .createAchCharge(bankAccount.customer, paymentData)
                      .then((charge) => {
                        new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            log.info('EXISTING_CUSTOMER_ACH_CHARGE_SUCCESS');
                            return res
                              .status(200)
                              .json({message: 'EXISTING_CUSTOMER_ACH_CHARGE_SUCCESS'});
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_SAVING_DATA');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_SAVING_DATA'});
                          });
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_CREATING_CHARGE');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_CREATING_CHARGE'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_VERIFY_CUSTOMER');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_VERIFY_CUSTOMER'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_RETRIEVE_UPDATE_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_ACH_CHARGE_RETRIEVE_UPDATE_CUSTOMER'});
              });
          }
        } else {
          //New customer recurringPayment
          if (paymentData.status) {
            stripeAchPayment
              .createPlan(paymentData)
              .then((plan) => {
                stripeAchPayment
                  .createAchCustomer(paymentData)
                  .then((customer) => {
                    stripeAchPayment
                      .verifyCustomer(customer)
                      .then((bankAccount) => {
                        stripeAchPayment
                          .createAchSubscription(bankAccount.customer, paymentData)
                          .then((subscription) => {
                            new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                              .save()
                              .then(() => {
                                log.info('NEW_CUSTOMER_ACH_RECURRING_SUCCESS');
                                return res
                                  .status(200)
                                  .json({message: 'NEW_CUSTOMER_ACH_RECURRING_SUCCESS'});
                              })
                              .catch((err) => {
                                log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_SAVING_DATA');
                                return res
                                  .status(400)
                                  .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_SAVING_DATA'});
                              });
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_SUBSCRIPTION');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_SUBSCRIPTION'});
                          });
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_VERIFY_CUSTOMER');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_VERIFY_CUSTOMER'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_CREATING_CUSTOMER');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_CREATING_CUSTOMER'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_CREATING_PLAN');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_RECURRING_CREATING_PLAN'});
              });
          } else {
            //Ach chargePayment
            stripeAchPayment
              .createAchCustomer(paymentData)
              .then((customer) => {
                stripeAchPayment.verifyCustomer(customer)
                  .then((bankAccount) => {
                    stripeAchPayment
                      .createAchCharge(bankAccount.customer, paymentData)
                      .then((charge) => {
                        new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            log.info('NEW_CUSTOMER_ACH_CHARGE_SUCCESS');
                            return res
                              .status(200)
                              .json({message: 'NEW_CUSTOMER_ACH_CHARGE_SUCCESS'});
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_SAVING_DATA');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_SAVING_DATA'});
                          })
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_CREATING_CHARGE');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_CREATING_CHARGE'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_VERIFY_CUSTOMER');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_VERIFY_CUSTOMER'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_CREATING_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_NEW_CUSTOMER_ACH_CHARGE_CREATING_CUSTOMER'});
              });
          }
        }
      })
    .catch((err) => {
      log.info('DATABASE_ERROR');
      return res
        .status(400)
        .json({error: 'DATABASE_ERROR'});
    })
}

function postCreditCard(req, res) {
  let customerId;
  let paymentData = req.body;
  let paymentType = 'Card';
  let stripeStatus;
  let stripeCardPayment = new stripeCard();

  //Empty req.
  if (Object.keys(req.body).length === 0) {
    log.info('INVALID_BODY');
    return res
      .status(400)
      .json({message: 'INVALID_BODY'});
  }

  //Check the customer in MONGOdb
  donations
    .getRecordByEmail(paymentData.email)
    .then(
      (data) => {
        if (data.length === 0) {
          stripeStatus = false;
        } else {
          stripeStatus = true;
          if (data[0].customerId !== '') {
            customerId = data[0].customerId;
          } else {
            log.info('ERROR_WHILE_GETTING_DATA');
            return res
              .status(400)
              .json({error: 'ERROR_WHILE_CHEKING_CUSTOMERID'});
          }
        }

        //If customer exist recurringPayment
        if (stripeStatus) {
          if (paymentData.status) {
            stripeCardPayment
              .retrieveAndUpdateCustomer(customerId, paymentData)
              .then((retrieveAndUpdateCustomer) => {
                stripeCardPayment.createPlan(paymentData)
                  .then((plan) => {
                    stripeCardPayment
                      .createCardSubscription(customerId, paymentData)
                      .then((subscription) => {
                        new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            log.info('EXISTING_CUSTOMER_CARD_RECURRING_SUCCESS');
                            return res
                              .status(200)
                              .json({message: 'EXISTING_CUSTOMER_CARD_RECURRING_SUCCESS'});
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_SAVING_DATA');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_SAVING_DATA'});
                          });
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_SUBSCRIPTION');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_SUBSCRIPTION'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_CREATING_PLAN');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_CREATING_PLAN'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_PAYMENT_UPDATE_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_RECURRING_RETRIEVE_UPDATE_CUSTOMER'});
              });
          } else {
            //Card charge
            stripeCardPayment
              .retrieveAndUpdateCustomer(customerId, paymentData)
              .then((retrieveAndUpdateCustomer) => {
                    new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                      .save()
                      .then(() => {
                        log.info('EXISTING_CUSTOMER_CARD_CHARGE_SUCCESS');
                        return res
                          .status(200)
                          .json({message: 'EXISTING_CUSTOMER_CARD_CHARGE_SUCCESS'});
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_CHARGE_SAVING_DATA');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_CHARGE_SAVING_DATA'});
                      })
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_CHARGE_RETRIEVE_UPDATE_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_EXISTING_CUSTOMER_CARD_CHARGE_RETRIEVE_UPDATE_CUSTOMER'});
              });
          }
        } else {
          //New customer recurringPayment
          if (paymentData.status) {
            stripeCardPayment
              .createPlan(paymentData)
              .then((plan) => {
                stripeCardPayment
                  .createCardCustomer(paymentData)
                  .then((customer) => {
                    stripeCardPayment
                      .createCardSubscription(customer.id, paymentData)
                      .then((subscription) => {
                        new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                          .save()
                          .then(() => {
                            log.info('NEW_CUSTOMER_CARD_RECURRING_SUCCESS');
                            return res
                              .status(200)
                              .json({message: 'NEW_CUSTOMER_CARD_RECURRING_SUCCESS'});
                          })
                          .catch((err) => {
                            log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_SAVING_DATA');
                            return res
                              .status(400)
                              .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_SAVING_DATA'});
                          });
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_SUBSCRIPTION');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_SUBSCRIPTION'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_PAYMENT_CUSTOMER');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_CREATING_CUSTOMER'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_CREATING_PLAN');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_RECURRING_CREATING_PLAN'});
              });
          } else {
            //Card chargePayment
            stripeCardPayment
              .createCardCustomer(paymentData)
              .then((customer) => {
                stripeCardPayment
                  .createCardCharge(customer.id, paymentData)
                  .then((charge) => {
                    new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName)
                      .save()
                      .then(() => {
                        log.info('NEW_CUSTOMER_CARD_CHARGE_SUCCESS');
                        return res
                          .status(200)
                          .json({message: 'NEW_CUSTOMER_CARD_CHARGE_SUCCESS'});
                      })
                      .catch((err) => {
                        log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_SAVING_DATA');
                        return res
                          .status(400)
                          .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_SAVING_DATA'});
                      });
                  })
                  .catch((err) => {
                    log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_CREATING_CHARGE');
                    return res
                      .status(400)
                      .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_CREATING_CHARGE'});
                  });
              })
              .catch((err) => {
                log.error(err, 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_CREATING_CUSTOMER');
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_NEW_CUSTOMER_CARD_CHARGE_CREATING_CUSTOMER'});
              });
          }
        }
      })
    .catch((err) => {
      log.error(err, 'DATABASE_ERROR');
      return res
        .status(400)
        .json({error: 'DATABASE_ERROR'});
    })
}
