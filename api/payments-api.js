'use strict';

const ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const creditCard = require('../models/credit-card');
const encodeKey = base64.encode(config.recurly.API_KEY);
const express = require('express');
const router = express.Router();
const request = require('request');
const mongo = require('../access/mongo');
const donations = require('../models/donations');
const searchDonations = require('../models/search-donations');

const stripeCard = require('../models/stripe-card');

let currency = config.stripe.currency;
let interval = config.stripe.interval;
let stripe = require('stripe')(config.stripe.stripeKey);

// API for  ACH payment
router.post('/ach', postAch);
// APi for  credit card payment
router.post('/creditcard', postCreditCard);
module.exports = router;

let customerId;
let metadata;
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
          stripe
            .subscriptions
            .create({
              customer: id,
              plan: paymentData.data.id,
              metadata: createMetaData()
            }).then(subscription => {
            new donations(subscription, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
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
              .json({error: 'ERROR_CREATING_SUBSCRIPTION'});
          })
        }

        //createAchCharge
        function createAchCharge(id) {
          stripe
            .charges
            .create({
              amount: paymentData.amount * 100,
              currency: currency,
              customer: id,
              metadata: createMetaData()
            }).then(charge => {
            new donations(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
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
              .json({error: 'ERROR_CREATING_CHARGE'});
          })
        }

        //achSubscription for Existingcustomer
        if (paymentData.status === true) {
          stripe
            .plans
            .create({
              name: paymentData.email,
              id: paymentData.data.id,
              interval: interval,
              currency: currency,
              amount: paymentData.amount * 100,
            }).then(plan => {
            if (stripeStatus) {
              createAchSubscription(customerId);
            } else {
              //achSubscription for NewCustomer
              stripe
                .customers
                .create({
                  source: paymentData.data.id,
                  email: paymentData.email,
                }).then(customer => {
                stripe
                  .customers
                  .verifySource(
                    customer.id,
                    customer.default_source, {
                      amounts: [32, 45]
                    }).then(bankAccount => {
                  createAchSubscription(bankAccount.customer);
                }).catch((err) => {
                  return res
                    .status(400)
                    .json({error: 'ERROR_CREATING_BANKACCOUNT'});
                })
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_CREATING_CUSTOMER'});
              })
            }
          }).catch((err) => {
            return res
              .status(400)
              .json({error: 'ERROR_CREATING_PLAN'});
          })
        } else {
          if (stripeStatus) {
            //achCharge for ExistingCustomer
            createAchCharge(customerId);
          } else {
            //achCharge for NewCustomer
            stripe
              .customers
              .create({
                source: paymentData.data.id,
                email: paymentData.email,
              }).then(customer => {
              stripe
                .customers
                .verifySource(
                  customer.id,
                  customer.default_source,
                  {
                    amounts: [32, 45]
                  }).then(bankAccount => {
                createAchCharge(bankAccount.customer);
              }).catch((err) => {
                return res
                  .status(400)
                  .json({error: 'ERROR_CREATING_BANKACCOUNT'});
              })
            }).catch((err) => {
              return res
                .status(400)
                .json({error: 'ERROR_CREATING_CUSTOMER'});
            })
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
          console.log('this is existing')
          if (paymentData.status) {
            console.log('This is recurring existing...')

            stripeCardPayment.createPlan(paymentData).then((plan) => {

              console.log('plan created succcc-----1 ')
              console.log(plan)

              stripeCardPayment.createCardSubscription(customerId, paymentData).then((charge) => {

                console.log('This is duplicate existing customer...');
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
                console.log("err")
                console.log(err)
                return res
                  .status(400)
                  .json({error: 'ERROR_SAVING_DATA'});
              })


            }).catch((err) => {
              console.log(err)
              console.log(err)
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
              console.log(err)
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }

        } else {
          console.log('this is new')
          if (paymentData.status) {
            console.log('recurring');

            stripeCardPayment.createPlan(paymentData).then((plan) => {

              console.log('plan created succcc-----1 ')
              console.log(plan)

              stripeCardPayment.createCardCustomer(paymentData).then((customer) => {
                console.log('Customer created sucusfulyy.....')

                stripeCardPayment.createCardSubscription(customer.id, paymentData).then((charge) => {

                  console.log('This is new  sub for customer....');
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
                  console.log("err")
                  console.log(err)
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })

              }).catch((err) => {
                console.log('create customer..')
                console.log(err)
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
              });




            }).catch((err) => {
              console.log(err)
              console.log(err)
              return res
                .status(400)
                .json({error: 'ERROR_SAVING_DATA'});
            })




          } else {
            stripeCardPayment.createCardCustomer(paymentData).then((customer) => {
              console.log('Customer created sucusfulyy.....')
              stripeCardPayment.createCardCharge(customer.id, paymentData).then((charge) => {
                new donations(charge, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
                  return res
                    .status(200)
                    .json({message: 'succeeded'});
                }).catch((err) => {
                  console.log(err)
                  return res
                    .status(400)
                    .json({error: 'ERROR_SAVING_DATA'});
                })

              }).catch((err) => {
                console.log('charge')
                console.log(err)
                return res
                  .status(400)
                  .json({error: 'ERROR_WHILE_CHARGE_CUSTOMER'});
              });

            }).catch((err) => {
              console.log('create customer..')
              console.log(err)
              return res
                .status(400)
                .json({error: 'ERROR_WHILE_CREATING_CUSTOMER'});
            });
          }


        }


        //createMetaData
        // function createMetaData() {
        //   metadata = {
        //     userName: paymentData.data.card.name,
        //     Email: paymentData.email,
        //     address1: paymentData.data.card.address_line1,
        //     address2: paymentData.data.card.address_line2,
        //     city: paymentData.data.card.address_city,
        //     state: paymentData.data.card.address_state,
        //     zip: paymentData.data.card.address_zip,
        //     country: paymentData.data.card.address_country,
        //     firstName: paymentData.donorFirstName,
        //     lastName: paymentData.donorLastName,
        //     phoneNumber: paymentData.phoneNumber
        //   };
        //   return metadata;
        // }
        //
        // //createCardSubscription
        // function createCardSubscription(id) {
        //   stripe
        //     .subscriptions
        //     .create({
        //       customer: id,
        //       plan: paymentData.data.id,
        //       metadata: createMetaData()
        //     }).then(subscription => {
        //     new donations(subscription, paymentType, paymentData.donorFirstName, paymentData.donorLastName).save().then(() => {
        //       return res
        //         .status(200)
        //         .json({message: 'succeeded'});
        //     }).catch((err) => {
        //       return res
        //         .status(400)
        //         .json({error: 'ERROR_SAVING_DATA'});
        //     })
        //   }).catch((err) => {
        //     return res
        //       .status(400)
        //       .json({error: 'ERROR_CREATING_SUBSCRIPTION'});
        //   })
        // }
        //
        // //createCardCharge
        // function createCardCharge(id) {
        //   stripe
        //     .charges
        //     .create({
        //       amount: paymentData.amount * 100,
        //       currency: currency,
        //       customer: id,
        //       metadata: createMetaData()
        //     }).then(charge => {
        //     new donations(charge, paymentType, paymentType.donorFirstName, paymentData.donorLastName).save().then(() => {
        //       return res
        //         .status(200)
        //         .json({message: 'succeeded'});
        //     }).catch((err) => {
        //       return res
        //         .status(400)
        //         .json({error: 'ERROR_SAVING_DATA'});
        //     })
        //   }).catch((err) => {
        //     return res
        //       .status(400)
        //       .json({error: 'ERROR_CREATING_CHARGE'});
        //   })
        // }
        //
        // //cardSubscription for Existingcustomer
        // if (paymentData.status === true) {
        //   stripe
        //     .plans
        //     .create({
        //       name: paymentData.email,
        //       id: paymentData.data.id,
        //       interval: interval,
        //       currency: currency,
        //       amount: paymentData.amount * 100,
        //     }).then(plan => {
        //     if (stripeStatus) {
        //       createCardSubscription(customerId);
        //     } else {
        //       //cardSubscription for Newcustomer
        //       stripe
        //         .customers
        //         .create({
        //           source: paymentData.data.id,
        //           email: paymentData.email,
        //         }).then(customer => {
        //         createCardSubscription(customer.id);
        //       }).catch((err) => {
        //         return res
        //           .status(400)
        //           .json({error: 'ERROR_CREATING_CUSTOMER'});
        //       })
        //     }
        //   }).catch((err) => {
        //     return res
        //       .status(400)
        //       .json({error: 'ERROR_CREATING_PLAN'});
        //   })
        // } else {
        //   //cardCharge for Existingcustomer
        //   if (stripeStatus) {
        //     createCardCharge(customerId);
        //   } else {
        //     //cardCharge for Newcustomer
        //     stripe
        //       .customers
        //       .create({
        //         source: paymentData.data.id,
        //         email: paymentData.email,
        //       }).then(customer => {
        //       createCardCharge(customer.id);
        //     }).catch((err) => {
        //       return res
        //         .status(400)
        //         .json({error: 'ERROR_CREATING_CUSTOMER'});
        //     })
        //   }
        // }


      }).catch((err) => {
    return res
      .status(400)
      .json({error: 'DATABASE ERROR'});
  })
}
