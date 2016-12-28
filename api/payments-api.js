"use strict"

const Ach = require('../models/ach');
const base64 = require('base-64');
const config = require('../access/config');
const CreditCard = require('../models/credit-card');
const encodedKey = base64.encode(config.recurly.API_KEY);
const express = require('express');
const router = express.Router();
const request = require('request');


var stripe = require('stripe')("sk_test_J0awUPn92Yeo4OkqpTEaaEbE")


// API for recurly ACH payment
router.post('/ach', postAch);

// APi for recurly credit card payment
router.post('/creditcard', postCreditCard);

module.exports = router;

/////////////
function postAch(req, res) {

  if(req.body.status==true)
              {
                 stripe.customers.create
                  ({
                      source: req.body.data.id,
                      email: req.body.email,     
                   },function(err,customer)
                        {   
                            if(err)
                                {
                                   console.log("customer"+err);
                                   res.send("444");
                                }else
                                   {
                                       stripe.customers.verifySource(
                                       customer.id,
                                       customer.default_source,
                                        {
                                           amounts: [32, 45]
                                        },
                                       function(err, bankAccount)
                                         {
                                             if(err)
                                              {
                                                 console.log("bankAccount error");
                                                 res.send("444")
                                              }else
                                                   {
                                                        // if(customer.account_balance< (req.body.amount * 100))
                                                        //   {
                                                        //       console.log("Please check the amount in your account");
                                                              
                                                        //           res.send({'status':400,
                                                        //       'message':"Please check the amount in your card"});
                                                        //   }else
                                                        //      {
                                                                  stripe.subscriptions.create
                                                                    ({
                                                                        customer: customer.id,
                                                                        plan: "TestPlan",
                                                                         metadata:{
                                                                                    userName:req.body.data.bank_account.name,
                                                                                    Email:req.body.email,
                                                                                    Address1:req.body.address1,
                                                                                    Address2:req.body.address2,
                                                                                    City:req.body.city,
                                                                                    State:req.body.state,
                                                                                    Zip:req.body.zip,
                                                                                    Country:req.body.country,
                                                                                    phoneNumber:req.body.phoneNumber
                                                                                  },
                                                                      }, function(err, subscription) 
                                                                           {
                                                                               if(err)
                                                                                  {
                                                                                      res.send("subscription error");
                                                                                     res.send("444");
                                                                                  }
                                                                                 else
                                                                                  {
                                                                                      console.log("Recurly transaction done Sucessfully");
                                                                                       res.send("200");
                                                                                  }

                                                                              });
                                                                        
                                                                // }
                                          
                                                       }
                                          
                                          });
                                       }
                                     
                                });

                }else{

                        stripe.customers.create
                      ({
                          source: req.body.data.id,
                       },function(err,customer)
                           {   
                          
                              if(err)
                              {
                                  console.log("customer");
                                  res.send("444");
                              }
                              else
                              {
                                  stripe.customers.verifySource(
                                  customer.id,
                                  customer.default_source,
                                  {
                                    amounts: [32, 45]
                                  }, function(err, bankAccount)
                                      {
                                          if(err)
                                          {
                                              console.log("bankAccount error");
                                              res.send("444");
                                          }
                                          else
                                          {
                                              // if(customer.account_balance < (req.body.amount * 100))
                                              //    {

                                              //           console.log(" Please check the amount in card");
                                              //           res.send({'status':400,
                                              //             'message':"Please check the amount in your card"});
                                              //    }else
                                              //    {
                                                      stripe.charges.create
                                                      ({
                                                          amount:req.body.amount *100,
                                                          description: "ACH bank_account olive",
                                                          currency: "usd",
                                                          customer: customer.id,
                                                          metadata: {
                                                                      userName:req.body.data.bank_account.name,
                                                                      Email:req.body.email,
                                                                      Address1:req.body.address1,
                                                                      Address2:req.body.address2,
                                                                      City:req.body.city,
                                                                      State:req.body.state,
                                                                      Zip:req.body.zip,
                                                                      Country:req.body.country,
                                                                      phoneNumber:req.body.phoneNumber
                                                                      },
                                                       },function(err,charge)
                                                          {
                                                              if(err)
                                                              {
                                                                  console.log("charge error");
                                                                  res.send("444");
                                                                  
                                                              }
                                                              else{
                                                                     res.send("200");
                                                                    console.log("Single ACH bank_account transaction done sucessfully")
                                                                       
                                                                  }
                                      
                                                          }) 
                                                // }
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


                if(req.body.status==true)
                {
                  stripe.customers.create
                      ({
                          source:req.body.data.id,
                          email: req.body.email,
                        },function(err,customer)
                            {     
                                if(err)
                                   {
                                      console.log("customer error");
                                      res.send("444");
                                    }
                                    else
                                     {
                                         // if(customer.account_balance< (req.body.amount * 100))
                                         // {

                                         //        console.log(" Please check the amount in your card");
                                         //       res.send({'status':400,
                                         //                  'message':"Please check the amount in your card"});
                                         // }else{
                                                                                  
                                                    stripe.subscriptions.create
                                                       ({
                                                             customer: customer.id,
                                                              plan: "666624680067334",
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
                                                         }, function(err, subscription)
                                                              {
                                                                 if(err)
                                                                    {
                                                                      console.log("subscription error");
                                                                      console.log(err);
                                                                      res.send('444');
                                                                    }else

                                                                      {
                                                                        console.log("recurly transactiondone")
                                                                        res.send('200');
                                                                      }

                                                                });
                                                      
                                                // }

                                      }
                              });
                                

               

                 } else{
                           stripe.customers.create
                           ({
                                source: req.body.data.id,
                            },function(err,customer)
                            {     
                               if(err)
                                  {
                                        
                                      console.log("customer error");
                                      res.send("444");
                                  }
                                  else
                                  {
                                      // if(customer.account_balance< (req.body.amount * 100))
                                      //    {

                                      //           console.log(" Please check the amount in your card");
                                      //           res.send({'status':400,
                                      //                     'message':"Please check the amount in your card"});
                                      //    }else
                                      //    {
                                              stripe.charges.create
                                              ({
                                                  amount:req.body.amount * 100,
                                                  description: "custom stripe single payment",
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
                                              },function(err,charge)
                                                {
                                                    if(err)
                                                    {
                                                      
                                                        console.log("charge error");
                                                       res.send('444');
                                                    }
                                                    else{
                                                           console.log("Single Transcation has been done sucessfully");
                                                          
                                                           res.send('200');
                                                         }
                                
                                               })
                                        // }
                 
                                }
                            })



                    }





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


