"use strict"

const express = require('express');
const router = express.Router();
const User = require('../models/user');

const request = require('request');
const base64 = require('base-64');
const encodedData = base64.encode('7a4a27967d674d6885923933bcef12fd');

// APi for recurly credit card payment
router.post('/creditcard', function (req, res) {

    if (Object.keys(req.body).length === 0) {
        res.status(422).json({"Message": "Sorry, Please send some data!"});
    } else {
        let paymentData = req.body;
        if (paymentData.monthlyGiving) {
            let sub_url = "https://kids-discover-test.recurly.com/v2/subscriptions";
            let sub_body = "<subscription href='https://kids-discover-test.recurly.com/v2/subscriptions' type='credit_card'>" +
                "<plan_code>ifgmonthlysb</plan_code>" +
                "<unit_amount_in_cents type='integer'>" + paymentData.amount + "</unit_amount_in_cents>" +
                "<currency>USD</currency>" +
                "<account>" +
                "<account_code>" + paymentData.emailId + "</account_code>" +
                "<first_name>" + paymentData.firstName + "</first_name>" +
                "<last_name>" + paymentData.lastName + "</last_name>" +
                "<email>" + paymentData.emailId + "</email>" +
                "<company_name>ifgathering</company_name>" +
                "<address><address1>" + paymentData.addressOne + "</address1><address2 nil='nil'/><city>" + paymentData.city + "</city><state>" + paymentData.StateCode + "</state><zip>" + paymentData.zipCode + "</zip><country>" + paymentData.countryList + "</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='credit_card'><first_name>" + paymentData.firstName + "</first_name><last_name>" + paymentData.lastName + "</last_name><address1>" + paymentData.addressOne + "</address1>" +
                "<address2 nil='nil'/><city>" + paymentData.city + "</city><state>" + paymentData.StateCode + "</state>" +
                "<zip>" + paymentData.zipCode + "</zip><country>" + paymentData.countryList + "</country>" +
                "<phone nil='nil'/>" +
                "<vat_number nil='nil'/>" +
                "<number>" + paymentData.CCNumber + "</number>" +
                "<year type='integer'>" + paymentData.CCYear + "</year><month type='integer'>" + paymentData.CCMonth + "</month>" +
                "<verification_value>" + paymentData.CVV + "</verification_value></billing_info>" +
                "</account>" +
                "</subscription>";
            let sub_headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic ' + encodedData
            };
            request.post({url: sub_url, body: sub_body, headers: sub_headers}, function (error, response, body) {
                if (error) {
                    return error;
                } else {
                    if (response.statusCode === 201) {
                        return res.json({'msg': 'success'});
                    } else {
                        return res.json({'status_code': response.statusCode, 'body': response.body});
                    }
                }
            });
        } else {
            let body = "<transaction href='https://kids-discover-test.recurly.com/v2/transactions'>" +
                "<account href='https://kids-discover-test.recurly.com/v2/accounts/" + paymentData.emailId + "'/><amount_in_cents type='integer'>" + paymentData.amount + "</amount_in_cents><currency>USD</currency>" +
                "<payment_method>credit_card</payment_method>" +
                "<account><account_code>" + paymentData.emailId + "</account_code><first_name>" + paymentData.firstName + "</first_name>" +
                "<last_name>" + paymentData.lastName + "</last_name><email>" + paymentData.emailId + "</email>" +
                "<company_name>ifgathering</company_name>" +
                "<address><address1>" + paymentData.addressOne + "</address1><address2 nil='nil'/><city>" + paymentData.city + "</city><state>" + paymentData.StateCode + "</state><zip>" + paymentData.zipCode + "</zip><country>" + paymentData.countryList + "</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='credit_card'><first_name>" + paymentData.firstName + "</first_name>" +
                "<last_name>" + paymentData.lastName + "</last_name><address1>" + paymentData.addressOne + "</address1><address2 nil='nil'/><city>" + paymentData.city + "</city><state>" + paymentData.StateCode + "</state>" +
                "<zip>" + paymentData.zipCode + "</zip><country>" + paymentData.countryList + "</country><phone nil='nil'/><vat_number nil='nil'/><year type='integer'>" + paymentData.CCYear + "</year>" +
                "<month type='integer'>" + paymentData.CCMonth + "</month><number>" + paymentData.CCNumber + "</number></billing_info></account></transaction>";
            let url = "https://kids-discover-test.recurly.com/v2/transactions";
            let headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic ' + encodedData
            };
            request.post({url: url, body: body, headers: headers}, function (error, response, body) {
                if (error) {
                    return response.json(error);
                } else {
                    if (response.statusCode === 201) {
                        return res.json({'msg': 'success'});
                    } else {
                        return res.json({'status_code': response.statusCode, 'body': response.body});
                    }

                }
            });
        }

    }

});

// API for recurly ACH payment
router.post('/ach', function (req, res) {

    if (Object.keys(req.body).length === 0) {
        res.status(422).json({"Message": "Sorry, Please send some data!"});
    } else {
        let paymentDataACH = req.body;

        if (paymentDataACH.monthlyGiving) {
            let sub_body = "<subscription href='https://kids-discover-test.recurly.com/v2/subscriptions' type='bank_account'>" +
                "<plan_code>ifgmonthlysb</plan_code>" +
                "<unit_amount_in_cents type='integer'>" + paymentDataACH.amount + "</unit_amount_in_cents>" +
                "<currency>USD</currency>" +
                "<account><account_code>" + paymentDataACH.emailId + "</account_code><first_name>" + paymentDataACH.firstName + "</first_name><last_name>" + paymentDataACH.lastName + "</last_name>" +
                "<email>" + paymentDataACH.emailId + "</email>" +
                "<company_name>ifgathering</company_name>" +
                "<address><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>" + paymentDataACH.StateCode + "</state><zip>" + paymentDataACH.zipCode + "</zip><country>" + paymentData.countryList + "</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='credit_card'><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>" + paymentDataACH.StateCode + "</state><zip>" + paymentDataACH.zipCode + "</zip>" +
                "<country>" + paymentDataACH.countryList + "</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>" + paymentDataACH.accountName + "</name_on_account><account_type>" + paymentDataACH.accountType + "</account_type>" +
                "<account_number>" + paymentDataACH.accountNumber + "</account_number><company>OLIVE</company><routing_number type='integer'>" + paymentDataACH.routingNumber + "</routing_number></billing_info></account></subscription>";
            let sub_url = "https://kids-discover-test.recurly.com/v2/subscriptions";
            var sub_headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic ' + encodedData
            };
            request.post({url: sub_url, body: sub_body, headers: sub_headers}, function (error, response, body) {
                if (error) {
                    return error;
                } else {
                    if (response.statusCode === 201) {
                        return res.json({'msg': 'success'});
                    } else {
                        return res.json({'status_code': response.statusCode, 'body': response.body});
                    }
                }
            });

        } else {

            let AccountUrlACH = "https://kids-discover-test.recurly.com/v2/accounts/" + paymentDataACH.emailId;

            let body = "<transaction href='https://kids-discover-test.recurly.com/v2/transactions' type='bank_account'>" +
                "<account href='" + AccountUrlACH + "'/><amount_in_cents type='integer'>" + paymentDataACH.amount + "</amount_in_cents>" +
                "<currency>USD</currency><payment_method>ACH</payment_method>" +
                "<account><account_code>" + paymentDataACH.emailId + "</account_code><first_name>" + paymentDataACH.firstName + "</first_name><last_name>" + paymentDataACH.lastName + "</last_name>" +
                "<email>" + paymentDataACH.emailId + "</email>" +
                "<company_name>IFG</company_name>" +
                "<address><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>" + paymentDataACH.StateCode + "</state><zip>" + paymentDataACH.zipCode + "</zip><country>" + paymentDataACH.countryList + "</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='bank_account'><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>" + paymentDataACH.StateCode + "</state><zip>" + paymentDataACH.zipCode + "</zip>" +
                "<country>" + paymentDataACH.countryList + "</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>" + paymentDataACH.accountName + "</name_on_account><account_type>" + paymentDataACH.accountType + "</account_type>" +
                "<account_number>" + paymentDataACH.accountNumber + "</account_number><company>OLIVE</company><routing_number type='integer'>" + paymentDataACH.routingNumber + "</routing_number></billing_info></account></transaction>";
            let url = "https://kids-discover-test.recurly.com/v2/transactions";
            let headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic ' + encodedData
            };
            request.post({url: url, body: body, headers: headers}, function (error, response, body) {
                if (error) {
                    return error;
                } else {
                    if (response.statusCode === 201) {
                        return res.json({'msg': 'success'});
                    } else {
                        return res.json({'status_code': response.statusCode, 'body': response.body});
                    }
                }
            });
        }
    }
});


router.get('/', function (req, res) {
    res.send('responded');
});

module.exports = router;
