'use strict'

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
      function createMetaData(){
        let metadata={
          userName: paymentData.data.bank_account.name,
          Email: paymentData.email,
          Address1: paymentData.address1,
          Address2: paymentData.address2,
          City: paymentData.city,
          State: paymentData.state,
          Zip: paymentData.zip,
          Country: paymentData.country,
          phoneNumber: paymentData.phoneNumber
        }
        return metadata;
      }

      function createCardSubscription(id) {
        stripe.subscriptions.create({
          customer: id,
          plan: paymentData.data.id,
          metadata:createMetaData()
        }).then(subscription=>{
          new Donations(subscription, paymentType).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
        })
      }


      //createCardCharge
      function createCardCharge(id){
        stripe.charges.create({
          amount: paymentData.amount * 100,
          currency: 'usd',
          customer: id,
          metadata:createMetaData()
        }).then(charge=> {
          new Donations(charge, paymentType).save().then(() => {
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
        }, function (err, plan) {
          if (err) return res.send(444);
          if (stripeStatus === true) {
            createCardSubscription(customerId);
          } else {
            //achSubscription for NewCustomer
            stripe.customers.create({
              source: paymentData.data.id,
              email: paymentData.email,
            }).then(customer=>{
              stripe.customers.verifySource(
                customer.id,
                customer.default_source,{
                  amounts: [32, 45]
                }).then(bankAccount=>{
                createCardSubscription(bankAccount.customer);
              }).catch((err) => {
                return res.send(444);
              })
            }).catch((err) => {
              return res.send(444);
            })
          }
        });
      } else {
        if (stripeStatus == true) {
          //achCharge for ExistingCustomer
          createCardCharge(customerId);
        } else {
          //achCharge for NewCustomer
          stripe.customers.create({
            source: paymentData.data.id,
            email: paymentData.email,
          }).then(customer=>{
            stripe.customers.verifySource(
              customer.id,
              customer.default_source,
              {
                amounts: [32, 45]
              }).then(bankAccount=>{
              createCardCharge(bankAccount.customer);
            }).catch((err) => {
              return res.send(444);
            })
          }).catch((err) => {
            return res.send(444);
          })
        }
      }
    })
    .catch((err) => {
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
      function createMetaData(){
        let metadata= {
          userName: paymentData.data.card.name,
          Email: paymentData.email,
          Address1: paymentData.data.card.address_line1,
          Address2: paymentData.data.card.address_line2,
          City: paymentData.data.card.address_city,
          State: paymentData.data.card.address_state,
          Zip: paymentData.data.card.address_zip,
          Country: paymentData.data.card.address_country,
          phoneNumber: paymentData.phoneNumber
        }
        return metadata;

      }

      //createCardCharge
      function createCardCharge(id) {
        stripe.charges.create({
          amount: paymentData.amount * 100,
          currency: 'usd',
          customer: id,
          metadata:createMetaData()
        }).then( charge=> {
          new Donations(charge, paymentType).save().then(() => {
            return res.send(200);
          }).catch(() => {
            return res.send(444);
          })
        }).catch(() => {
          return res.send(444);
        })
      }

      //createCardSubscription
      function createCardSubscription(id){
        stripe.subscriptions.create({
          customer: id,
          plan: paymentData.data.id,
          metadata:createMetaData()
        }).then(subscription=>{
          new Donations(subscription, paymentType).save().then(() => {
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
        }, function (err, plan){
          if (err) return res.send(444);
          if (stripeStatus == true) {
            customerId = customerId;
            createCardSubscription(customerId);
          } else {
            //cardSubscription for Newcustomer
            stripe.customers.create({
              source: paymentData.data.id,
              email: paymentData.email,
            }).then(customer=>{
              if (err) return res.send(444);
              createCardSubscription(customer.id);
            }).catch((err) => {
              return res.send(444);
            })
          }
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
          }).then(customer=>{
            createCardCharge(customer.id);
          }).catch((err) => {
            return res.send(444);
          })
        }
      }
    })
    .catch((err) => {
      return res.send(444);
    })


//Sample code....


  // Commenting Up stream code now

  // if (Object.keys(req.body).length === 0) {
  //   return res
  //     .status(422)
  //     .json({message: 'INVALID BODY'});
  // }

  // let paymentData = req.body;
  // if (paymentData.monthlyGiving) {
  //   let url = config.recurly.subscriptionURL;
  //   let body = getMonthlyGivingBody();
  //   let headers = {
  //     'Accept': 'application/xml',
  //     'Authorization': 'Basic ' + encodedKey
  //   };

  //   request
  //     .post({
  //         url: url,
  //         body: body,
  //         headers: headers
  //       },
  //       function (recurlyErr, response, recurlyResponseBody) {
  //         if (recurlyErr) {
  //           console.error(recurlyErr); // ideally this should actually be logging using winston or something
  //           return res
  //             .send(500)
  //             .json({error: 'RECURLY_MONTHLY_GIVING_ERROR'});

  //         } else {
  //           new CreditCard(recurlyResponseBody)
  //             .save()
  //             .then(() => {
  //               return (response.statusCode === 201)
  //                 ? res.json({message: 'success'})
  //                 : res.json({status_code: response.statusCode});
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               res.status(500).json({error: 'ERROR_SAVING_TRANSACTION'});
  //             });
  //         }
  //       });

  // } else {

  //   let body = getOneTimeGivingBody();
  //   let url = config.recurly.transactionURL;
  //   let headers = {
  //     'Accept': 'application/xml',
  //     'Authorization': 'Basic ' + encodedKey
  //   };

  //   request
  //     .post({
  //         url: url,
  //         body: body,
  //         headers: headers
  //       },
  //       function (recurlyErr, response, recurlyResponseBody) {
  //         if (recurlyErr) {
  //           console.error(recurlyErr);
  //           return res
  //             .send(500)
  //             .json({error: 'RECURLY_ONE_TIME_GIVING_ERROR'});

  //         } else {
  //           new CreditCard(recurlyResponseBody)
  //             .save()
  //             .then(() => {
  //               return (response.statusCode === 201)
  //                 ? res.json({message: 'success'})
  //                 : res.json({status_code: response.statusCode});
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               res.status(500).json({error: 'ERROR_SAVING_TRANSACTION'});
  //             });
  //         }
  //       });
  // }

  // /////
  // function getMonthlyGivingBody() {
  //   return `
  //       <subscription href="https://kids-discover-test.recurly.com/v2/subscriptions" type="credit_card">
  //         <plan_code>ifgmonthlysb</plan_code>
  //         <unit_amount_in_cents type="integer">${paymentData.amount}</unit_amount_in_cents>
  //         <currency>USD</currency>
  //         <account>
  //           <account_code>${paymentData.emailId}</account_code>
  //           <first_name>${paymentData.firstName}</first_name>
  //           <last_name>${paymentData.lastName}</last_name>
  //           <email>${paymentData.emailId}</email>
  //           <company_name>ifgathering</company_name>
  //           <address>
  //             <address1> ${paymentData.addressOne}</address1>
  //             <address2 nil="nil"/>
  //             <city> ${paymentData.city}</city>
  //             <state>${paymentData.StateCode}</state>
  //             <zip>${paymentData.zipCode}</zip>
  //             <country> ${paymentData.countryList}</country>
  //             <phone nil="nil"/>
  //           </address>
  //           <billing_info type="credit_card">
  //             <first_name>${paymentData.firstName}</first_name>
  //             <last_name>${paymentData.lastName}</last_name>
  //             <address1>${paymentData.addressOne}</address1>
  //             <address2 nil="nil"/>
  //             <city>${paymentData.city}</city>
  //             <state>${paymentData.StateCode}</state>
  //             <zip>${paymentData.zipCode}</zip>
  //             <country>${paymentData.countryList}</country>
  //             <phone nil="nil"/>
  //             <vat_number nil="nil"/>
  //             <number>${paymentData.CCNumber}</number>
  //             <year type="integer">${paymentData.CCYear}</year>
  //             <month type="integer"> ${paymentData.CCMonth}</month>
  //             <verification_value> ${paymentData.CVV}</verification_value>
  //           </billing_info>
  //         </account>
  //       </subscription>`;
  // }

  // function getOneTimeGivingBody() {
  //   return `
  //       <transaction href="https://kids-discover-test.recurly.com/v2/transactions">
  //         <account href="https://kids-discover-test.recurly.com/v2/accounts/${paymentData.emailId}/>
  //         <amount_in_cents type='integer'>${paymentData.amount}</amount_in_cents>
  //         <currency>USD</currency>
  //         <payment_method>credit_card</payment_method>
  //         <account>
  //           <account_code>${paymentData.emailId}</account_code>
  //           <first_name>${paymentData.firstName}</first_name>
  //           <last_name>${paymentData.lastName}</last_name>
  //           <email>${paymentData.emailId}</email>
  //           <company_name>ifgathering</company_name>


  //           <address>
  //             <address1>${paymentData.addressOne}</address1>
  //             <address2 nil='nil'/>
  //             <city>${paymentData.city}</city>
  //             <state>${paymentData.StateCode}</state>
  //             <zip>${paymentData.zipCode}</zip>
  //             <country>${paymentData.countryList}</country>
  //             <phone nil='nil'/>
  //           </address>
  //           <billing_info type='credit_card'>
  //             <first_name>${paymentData.firstName}</first_name>
  //             <last_name>${paymentData.lastName}</last_name>
  //             <address1>${paymentData.addressOne}</address1>
  //             <address2 nil='nil'/>
  //             <city>${paymentData.city}</city>
  //             <state>${paymentData.StateCode}</state>
  //             <zip>${paymentData.zipCode}</zip>
  //             <country>${paymentData.countryList}</country>
  //             <phone nil='nil'/>
  //             <vat_number nil='nil'/>
  //             <year type='integer'>${paymentData.CCYear}</year>
  //             <month type='integer'>${paymentData.CCMonth}</month>
  //             <number>${paymentData.CCNumber}</number>
  //           </billing_info>
  //         </account>
  //       </transaction>`;
  // }

//End of Commenting Up stream code now


}
