"use strict"

const Ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const CreditCard = require('../models/credit-card');
const encodedKey = base64.encode(config.recurly.API_KEY);
const express = require('express');
const router = express.Router();
const request = require('request');
const mongo = require('../access/mongo');


var stripe = require('stripe')("sk_test_J0awUPn92Yeo4OkqpTEaaEbE")


// API for recurly ACH payment
router.post('/ach', postAch);

// APi for recurly credit card payment
router.post('/creditcard', postCreditCard);

module.exports = router;

/////////////
function postAch(req, res) {
  if (req.body.status == true) {
    var plan = stripe.plans.create({
      name: req.body.email,
      id: req.body.data.id,
      interval: "day",
      currency: "usd",
      amount: req.body.amount * 100,
    }, function (err, plan) {
      if (err) {
        return res.status(444).send('Failure');
      } else {
        stripe.customers.create({
          source: req.body.data.id,
          email: req.body.email,
        }, function (err, customer) {
          if (err) {
            return res.status(444).send('Failure');
          } else {
            stripe.customers.verifySource(
              customer.id,
              customer.default_source,
              {
                amounts: [32, 45]
              },
              function (err, bankAccount) {
                if (err) {
                  return res.status(444).send('Failure');
                } else {
                  stripe.subscriptions.create({
                      customer: bankAccount.customer,
                      plan: req.body.data.id,
                      metadata: {
                        userName: req.body.data.bank_account.name,
                        Email: req.body.email,
                        Address1: req.body.address1,
                        Address2: req.body.address2,
                        City: req.body.city,
                        State: req.body.state,
                        Zip: req.body.zip,
                        Country: req.body.country,
                        phoneNumber: req.body.phoneNumber
                      },
                    }, function (err, subscription) {
                      if (err) {
                        return res.status(444).send('Failure');
                      } else {
                        //return res.status(200).send('Sucess');
                        console.log("...>subscription ...", subscription.id, subscription.customer, subscription.metadata.Email, subscription);
                        mongo.db.collection('ifg_ach').insertOne({
                          "_id": subscription.id,
                          "customerId": subscription.customer,
                          "emailId": subscription.metadata.Email,
                          "responseObj": subscription
                        }).then(() => {
                          console.log('mongo success');
                          res.sendStatus(200).json();
                        }).catch(()=> {
                          console.log('mongo error' + error);
                          //res.send('200');   
                        })
                      }

                    }
                  );

                }
              });
          }
        });
      }
    });

  } else {

    stripe.customers.create({
      source: req.body.data.id,
      email: req.body.email,
    }, function (err, customer) {
      if (err) {
        return res.status(444).send('Failure');
      }
      else {
        stripe.customers.verifySource(
          customer.id,
          customer.default_source,
          {
            amounts: [32, 45]
          }, function (err, bankAccount) {
            if (err) {
              return res.status(444).send('Failure');
            }
            else {
              stripe.charges.create({
                  amount: req.body.amount * 100,
                  currency: "usd",
                  customer: bankAccount.customer,
                  metadata: {
                    userName: req.body.data.bank_account.name,
                    Email: req.body.email,
                    Address1: req.body.address1,
                    Address2: req.body.address2,
                    City: req.body.city,
                    State: req.body.state,
                    Zip: req.body.zip,
                    Country: req.body.country,
                    phoneNumber: req.body.phoneNumber
                  },
                }, function (err, charge) {
                  if (err) {
                    return res.status(444).send('Failure');
                  } else {

                    //return res.status(200).send('Sucess');
                    mongo.db.collection('ifg_ach').insertOne({
                      "_id": charge.id,
                      "customerId": charge.customer,
                      "emailId": charge.metadata.Email,
                      "responseObj": charge
                    }).then(() => {
                      console.log('mongo success');
                      res.sendStatus(200).json();
                    }).catch(()=> {
                      console.log('mongo error' + error);
                      //res.send('200');   
                    })
                  }

                }
              )

            }

          });

      }


    })
  }

//Commenting the upstream code for internal purpose.
  // if (Object.keys(req.body).length === 0) {
  //   return res.status(422).json({message: 'INVALID BODY'});
  // }

  // let paymentDataACH = req.body;
  // if (paymentDataACH.monthlyGiving) {
  //   let body = getMonthlyGivingBody();
  //   let url = config.recurly.subscriptionURL;
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
  //             .json({error: 'RECURLY_MONTHLY_GIVING_ERROR'});

  //         } else {
  //           new Ach(recurlyResponseBody)
  //             .save()
  //             .then(() => {
  //               return (response.statusCode === 201)
  //                 ? res.json({message: 'success'})
  //                 : res.json({
  //                   status_code: response.statusCode,
  //                   body: response.body
  //                 });
  //             })
  //             .catch((err) => {
  //               console.log(err);
  //               res.status(500).json({error: 'ERROR_SAVING_TRANSACTION'});
  //             });
  //         }
  //       });

  // } else {

  //   let AccountUrlACH = "https://kids-discover-test.recurly.com/v2/accounts/" + paymentDataACH.emailId;

  //   let body = getOneTimeGivingBody();
  //   let url = config.recurly.transactionURL;
  //   let headers = {
  //     'Accept': 'application/xml',
  //     'Authorization': 'Basic ' + encodedKey
  //   };
  //   request.post({
  //       url: url,
  //       body: body,
  //       headers: headers
  //     },
  //     function (recurlyErr, response, recurlyResponseBody) {
  //       if (recurlyErr) {
  //         console.error(recurlyErr);
  //         return res
  //           .send(500)
  //           .json({error: 'RECURLY_ONE_TIME_GIVING_ERROR'});
  //       } else {
  //         new Ach(recurlyResponseBody)
  //           .save()
  //           .then(() => {
  //             return (response.statusCode === 201)
  //               ? res.json({message: 'success'})
  //               : res.json({
  //                 status_code: response.statusCode,
  //                 body: response.body
  //               });
  //           })
  //           .catch((err) => {
  //             console.log(err);
  //             res.status(500).json({error: 'ERROR_SAVING_TRANSACTION'});
  //           });
  //       }
  //     });
  // }

  // function getMonthlyGivingBody() {
  //   return `
  //     <subscription href="https://kids-discover-test.recurly.com/v2/subscriptions" type="bank_account">
  //       <plan_code>ifgmonthlysb</plan_code>
  //       <unit_amount_in_cents type="integer">${paymentDataACH.amount}</unit_amount_in_cents>
  //       <currency>USD</currency>
  //       <account>
  //         <account_code>${paymentDataACH.emailId}</account_code>
  //         <first_name>${paymentDataACH.firstName}</first_name>
  //         <last_name>${paymentDataACH.lastName}</last_name>
  //         <email>${paymentDataACH.emailId}</email>
  //         <company_name>ifgathering</company_name>
  //         <address>
  //             <address1>${paymentDataACH.addressOne}</address1>
  //             <address2 nil='nil'/>
  //             <city>${paymentDataACH.city}</city>
  //             <state>${paymentDataACH.StateCode}</state>
  //             <zip>${paymentDataACH.zipCode}</zip>
  //             <country>paymentData.countryList}</country>
  //             <phone nil='nil'/>
  //         </address>
  //         <billing_info type="credit_card">
  //             <address1>${paymentDataACH.addressOne}</address1>
  //             <address2 nil='nil'/>
  //             <city>${paymentDataACH.city}</city>
  //             <state>${paymentDataACH.StateCode}</state>
  //             <zip>${paymentDataACH.zipCode}</zip>
  //             <country>${paymentDataACH.countryList}</country>
  //             <phone nil='nil'/><vat_number nil='nil'/>
  //             <name_on_account>${paymentDataACH.accountName}</name_on_account>
  //             <account_type>${paymentDataACH.accountType}</account_type>
  //             <account_number>${paymentDataACH.accountNumber}</account_number>
  //             <company>OLIVE</company>
  //             <routing_number type='integer'>${paymentDataACH.routingNumber}</routing_number>
  //         </billing_info>
  //       </account>
  //     </subscription>
  //   `;
  // }

  // function getOneTimeGivingBody() {
  //   return `
  //       <transaction href="https://kids-discover-test.recurly.com/v2/transactions" type="bank_account">
  //           <account href="${AccountUrlACH}"/>
  //           <amount_in_cents type="integer">${paymentDataACH.amount}</amount_in_cents>
  //           <currency>USD</currency>
  //           <payment_method>ACH</payment_method>
  //           <account>
  //               <account_code>${paymentDataACH.emailId}</account_code>
  //               <first_name>${paymentDataACH.firstName}</first_name>
  //               <last_name>${paymentDataACH.lastName}</last_name>
  //               <email>${paymentDataACH.emailId}</email>
  //               <company_name>IFG</company_name>
  //               <address>
  //                 <address1>${paymentDataACH.addressOne}</address1>
  //                 <address2 nil="nil"/>
  //                 <city>${paymentDataACH.city}</city>
  //                 <state>${paymentDataACH.StateCode}</state>
  //                 <zip>${paymentDataACH.zipCode}</zip>
  //                 <country>${paymentDataACH.countryList}</country>
  //                 <phone nil="nil"/>
  //               </address>
  //               <billing_info type="bank_account">
  //                   <address1>${paymentDataACH.addressOne}</address1>
  //                   <address2 nil="nil"/>
  //                   <city>${paymentDataACH.city}</city>
  //                   <state>${paymentDataACH.StateCode}</state>
  //                   <zip>${paymentDataACH.zipCode}</zip>
  //                   <country>${paymentDataACH.countryList}</country>
  //                   <phone nil="nil"/>
  //                   <vat_number nil="nil"/>
  //                   <name_on_account>${paymentDataACH.accountName}</name_on_account>
  //                   <account_type>${paymentDataACH.accountType}</account_type>
  //                   <account_number>${paymentDataACH.accountNumber}</account_number>
  //                   <company>OLIVE</company>
  //                   <routing_number type="integer"${paymentDataACH.routingNumber}</routing_number>
  //               </billing_info>
  //           </account>
  //       </transaction>
  //     `;
  // }
}






      function postCreditCard(req, res) {
         var customerId ;
                  var Strpstatus;
                  var FinalData;
                  mongo
                      .db
                      .collection('ifg_creditCard')
                      .find({"emailId":req.body.email}).toArray()
                      .then((data) => {
                        console.log(data)
                                       
                                       FinalData = data;

                                       if(FinalData == ''){
                                        Strpstatus = false;
                                        console.log('false')
                                        
                                      } else{
                                        Strpstatus = true;
                                         customerId = FinalData[0].customerId;
                                         console.log("Final data"+FinalData);
                                      }

                                      })
                                      .catch((err) => {
                                                          console.log(err);
                                                      })  

                 if(req.body.status==true){
                     

                      var plan = stripe.plans.create({
                        name:req.body.email,
                        id: req.body.data.id,
                        interval: "day",
                        currency: "usd",
                        amount:req.body.amount *100,
                   }, function(err, plan){
                            if(err){
                              console.log('This is plan... errr')
                                      return res.status(444).send('Failure');
                            }else{
                              if (Strpstatus == true) {
                                              customerId = customerId;

                                              stripe.subscriptions.create({
                                                                          customer: customerId,
                                                                          plan: req.body.data.id,
                                                                          metadata:
                                                                           {
                                                                             userName:req.body.data.card.name,
                                                                             Email:req.body.email,
                                                                             Address1:req.body.data.card.address_line1,
                                                                             Address2:req.body.data.card.address_line2,
                                                                             City:req.body.data.card.address_city,
                                                                             State:req.body.data.card.address_state,
                                                                             Zip:req.body.data.card.address_zip,
                                                                             Country:req.body.data.card.address_country,
                                                                             phoneNumber:req.body.phoneNumber
                                                                            }
                                                                        }, function(err, subscription){
                                                                              if(err){
                                                                                       return res.status(444).send('Failure');
                                                                                }else{

                                                                                  mongo.db.collection('ifg_creditCard').insertOne({
                                                                                      "_id": subscription.id,
                                                                                      "customerId": subscription.customer,
                                                                                      "emailId": subscription.metadata.Email,
                                                                                      "responseObj": subscription
                                                                                    }).then(() => {
                                                                                      console.log('mongo success');
                                                                                      res.sendStatus(200).json();
                                                                                    }).catch(()=> {
                                                                                      console.log('mongo error' + error); 
                                                                                      //res.send('200');   
                                                                                      })
                                                                                        return res.status(200).send('Sucess');
                                                                                  }

                                                                            });

                                            }else{
                                              stripe.customers.create({
                                                source:req.body.data.id,
                                                email: req.body.email,
                                              },function(err,customer){     
                                                      if(err){
                                                                return res.status(444).send('Failure');
                                                              }else{
                                                                

                                                                      stripe.subscriptions.create({
                                                                          customer: customer.id,
                                                                          plan: req.body.data.id,
                                                                          metadata:
                                                                           {
                                                                             userName:req.body.data.card.name,
                                                                             Email:req.body.email,
                                                                             Address1:req.body.data.card.address_line1,
                                                                             Address2:req.body.data.card.address_line2,
                                                                             City:req.body.data.card.address_city,
                                                                             State:req.body.data.card.address_state,
                                                                             Zip:req.body.data.card.address_zip,
                                                                             Country:req.body.data.card.address_country,
                                                                             phoneNumber:req.body.phoneNumber
                                                                            }
                                                                        }, function(err, subscription){
                                                                              if(err){
                                                                                       return res.status(444).send('Failure');
                                                                                }else{

                                                                                  mongo.db.collection('ifg_creditCard').insertOne({
                                                                                      "_id":subscription.id,
                                                                                      "customerId": subscription.customer,
                                                                                      "emailId": subscription.metadata.Email,
                                                                                      "responseObj": subscription
                                                                                    }).then(() => {
                                                                                      console.log('mongo success');
                                                                                      res.sendStatus(200).json();
                                                                                    }).catch(()=> {
                                                                                      console.log('mongo error' + error); 
                                                                                      //res.send('200');   
                                                                                      })
                                                                                        return res.status(200).send('Sucess');
                                                                                  }

                                                                            });
                                                                                      
                                                                     }
                                                              });

                                                                }

                          
                                  }          
                             });
               

                 } else{

                          if (Strpstatus == true) {
                                stripe.charges.create({
                                                  amount:req.body.amount * 100,
                                                  currency: "usd",
                                                  customer: customerId,
                                                   metadata:{
                                                              userName:req.body.data.card.name,
                                                              Email:req.body.email,
                                                              Address1:req.body.data.card.address_line1,
                                                              Address2:req.body.data.card.address_line2,
                                                              City:req.body.data.card.address_city,
                                                              State:req.body.data.card.address_state,
                                                              Zip:req.body.data.card.address_zip,
                                                              Country:req.body.data.card.address_country,
                                                              phoneNumber:req.body.phoneNumber
                  
                                                            }
                                               },function(err,charge){
                                                    if(err){
                                                       return res.status(444).send('Failure');
                                                    }
                                                    else{

                                                                                  mongo.db.collection('ifg_creditCard').insertOne({
                                                                                      "_id": charge.id,
                                                                                      "customerId": charge.customer,
                                                                                      "emailId": charge.metadata.Email,
                                                                                      "responseObj": charge
                                                                                    }).then(() => {
                                                                                      console.log('mongo success');
                                                                                      res.sendStatus(200).json();
                                                                                    }).catch(()=> {
                                                                                      console.log('mongo error' + error); 
                                                                                      //res.send('200');   
                                                                                      })
                                                                                        return res.status(200).send('Sucess');
                                                                                  }
                                
                                                  })


                          } else{
                           stripe.customers.create({
                                source: req.body.data.id,
                                email: req.body.email, 
                            },function(err,customer)
                                {     
                                   if(err){
                                          return res.status(444).send('Failure');
                                      }
                                      else{
                                              stripe.charges.create({
                                                  amount:req.body.amount * 100,
                                                  currency: "usd",
                                                  customer: customer.id,
                                                   metadata:{
                                                              userName:req.body.data.card.name,
                                                              Email:req.body.email,
                                                              Address1:req.body.data.card.address_line1,
                                                              Address2:req.body.data.card.address_line2,
                                                              City:req.body.data.card.address_city,
                                                              State:req.body.data.card.address_state,
                                                              Zip:req.body.data.card.address_zip,
                                                              Country:req.body.data.card.address_country,
                                                              phoneNumber:req.body.phoneNumber
                  
                                                            }
                                               },function(err,charge){
                                                    if(err){
                                                       return res.status(444).send('Failure');
                                                    }
                                                    else{

                                                                                  mongo.db.collection('ifg_creditCard').insertOne({
                                                                                      "_id": charge.id,
                                                                                      "customerId": charge.customer,
                                                                                      "emailId": charge.metadata.Email,
                                                                                      "responseObj": charge
                                                                                    }).then(() => {
                                                                                      console.log('mongo success');
                                                                                      res.sendStatus(200).json();
                                                                                    }).catch(()=> {
                                                                                      console.log('mongo error' + error); 
                                                                                      //res.send('200');   
                                                                                      })
                                                                                        return res.status(200).send('Sucess');
                                                                                  }
                                
                                                  })
                                                       
                                          }
                              })
                         }

                    }


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


