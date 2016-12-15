var express = require('express');
var router = express.Router();
var User = require('../models/user');

var request = require('request');
var base64  = require('base-64');
var encodedData = base64.encode('7a4a27967d674d6885923933bcef12fd');

/* GET api home page. */
// API to add user
router.post('/addLead',function(req, res){
    var userInst = new User();
    if(Object.keys(req.body).length === 0 ){
        res.json({"Message" : "Sorry Buddy, Please send some data!"});
    } else {
        userInst.firstName = req.body.firstName;
        userInst.lastName = req.body.lastName;
        userInst.email = req.body.email;
        userInst.isLocalLeader = req.body.isLocalLeader;

        userInst.save({},function(err){
            if(err){
                res.send(err);
            }
            res.json({
                message: 'Leads added succesfully!', data: userinst
            });
        });

    }
});

// APi for recurly credit card payment
router.post('/creditcard', function (req, res) {

    if(Object.keys(req.body).length === 0 ){

        res.json({"Message" : "Sorry Buddy, Please send some data!"});
    } else {
        var paymentData = req.body;

        if(paymentData.monthlyGiving) {

            var sub_url = "https://kids-discover-test.recurly.com/v2/subscriptions";
            var sub_body = "<subscription href='https://kids-discover-test.recurly.com/v2/subscriptions' type='credit_card'>" +
                "<plan_code>ifgmonthlysb</plan_code>" +
                "<unit_amount_in_cents type='integer'>"+paymentData.amount+"</unit_amount_in_cents>" +
                "<currency>USD</currency>" +
                "<account>" +
                "<account_code>"+paymentData.emailId+"</account_code>" +
                "<first_name>"+paymentData.firstName+"</first_name>" +
                "<last_name>"+paymentData.lastName+"</last_name>" +
                "<email>"+paymentData.emailId+"</email>" +
                "<company_name>ifgathering</company_name>"+
                "<address><address1>"+paymentData.addressOne+"</address1><address2 nil='nil'/><city>"+paymentData.city+"</city><state>CO</state><zip>"+paymentData.zipCode+"</zip><country>US</country>" +
                "<phone nil='nil'/></address>"+
                "<billing_info type='credit_card'><first_name>"+paymentData.firstName+"</first_name><last_name>"+paymentData.lastName+"</last_name><address1>"+paymentData.addressOne+"</address1>" +
                "<address2 nil='nil'/><city>"+paymentData.city+"</city><state>CO</state>" +
                "<zip>"+paymentData.zipCode+"</zip><country>US</country>" +
                "<phone nil='nil'/>" +
                "<vat_number nil='nil'/>" +
                "<number>"+paymentData.CCNumber+"</number>" +
                "<year type='integer'>"+paymentData.CCYear+"</year><month type='integer'>"+paymentData.CCMonth+"</month>" +
                "<verification_value>"+paymentData.CVV+"</verification_value></billing_info>" +
                "</account>" +
                "</subscription>";
            var sub_headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic '+encodedData
            } ;
            request.post({ url: sub_url,body: sub_body,headers: sub_headers}, function(error, response, body) {
                if(error){
                    return error;
                } else {
                    if(response.statusCode === 201){
                        return res.json({'msg': 'success'});
                    } else {
                        return res.json({'status_code': response.statusCode, 'body': response.body});
                    }
                }
            });
        } else {

            var body = "<transaction href='https://kids-discover-test.recurly.com/v2/transactions'>" +
                "<account href='https://kids-discover-test.recurly.com/v2/accounts/"+paymentData.emailId+"'/><amount_in_cents type='integer'>"+paymentData.amount+"</amount_in_cents><currency>USD</currency>" +
                "<payment_method>credit_card</payment_method>" +
                "<account><account_code>"+paymentData.emailId+"</account_code><first_name>"+paymentData.firstName+"</first_name>" +
                "<last_name>"+paymentData.lastName+"</last_name><email>"+paymentData.emailId+"</email>" +
                "<company_name>ifgathering</company_name>" +
                "<address><address1>"+paymentData.addressOne+"</address1><address2 nil='nil'/><city>"+paymentData.city+"</city><state>CO</state><zip>"+paymentData.zipCode+"</zip><country>US</country>" +
                "<phone nil='nil'/></address>"+
                "<billing_info type='credit_card'><first_name>"+paymentData.firstName+"</first_name>" +
                "<last_name>"+paymentData.lastName+"</last_name><address1>"+paymentData.addressOne+"</address1><address2 nil='nil'/><city>"+paymentData.city+"</city><state>CO</state>" +
                "<zip>"+paymentData.zipCode+"</zip><country>US</country><phone nil='nil'/><vat_number nil='nil'/><year type='integer'>"+paymentData.CCYear+"</year>" +
                "<month type='integer'>"+paymentData.CCMonth+"</month><number>"+paymentData.CCNumber+"</number></billing_info></account></transaction>";
            var url = "https://kids-discover-test.recurly.com/v2/transactions";
            var headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic '+encodedData
            } ;
            request.post({ url: url,body: body,headers: headers}, function(error, response, body) {
                if(error){
                    return response.json(error);
                } else {
                    console.log(response.body);
                    if(response.statusCode === 201){
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

    if(Object.keys(req.body).length === 0 ){
        res.json({"Message" : "Sorry Buddy, Please send some data!"});
    } else {
        var paymentDataACH = req.body;

        if (paymentDataACH.monthlyGiving) {
            var sub_body = "<subscription href='https://kids-discover-test.recurly.com/v2/subscriptions' type='bank_account'>" +
                "<plan_code>ifgmonthlysb</plan_code>" +
                "<unit_amount_in_cents type='integer'>" + paymentDataACH.amount + "</unit_amount_in_cents>" +
                "<currency>USD</currency>" +
                "<account><account_code>" + paymentDataACH.emailId + "</account_code><first_name>" + paymentDataACH.firstName + "</first_name><last_name>" + paymentDataACH.lastName + "</last_name>" +
                "<email>" + paymentDataACH.emailId + "</email>" +
                "<company_name>ifgathering</company_name>" +
                "<address><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>CO</state><zip>" + paymentDataACH.zipCode + "</zip><country>US</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='credit_card'><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>CO</state><zip>" + paymentDataACH.zipCode + "</zip>" +
                "<country>US</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>" + paymentDataACH.accountName + "</name_on_account><account_type>" + paymentDataACH.accountType + "</account_type>" +
                "<account_number>" + paymentDataACH.accountNumber + "</account_number><company>OLIVE</company><routing_number type='integer'>" + paymentDataACH.routingNumber + "</routing_number></billing_info></account></subscription>";
            var sub_url = "https://kids-discover-test.recurly.com/v2/subscriptions";
            var sub_headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic '+encodedData
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

            var AccountUrlACH = "https://kids-discover-test.recurly.com/v2/accounts/" + paymentDataACH.emailId;

            var body = "<transaction href='https://kids-discover-test.recurly.com/v2/transactions' type='bank_account'>" +
                "<account href='" + AccountUrlACH + "'/><amount_in_cents type='integer'>" + paymentDataACH.amount + "</amount_in_cents>" +
                "<currency>USD</currency><payment_method>ACH</payment_method>" +
                "<account><account_code>" + paymentDataACH.emailId + "</account_code><first_name>" + paymentDataACH.firstName + "</first_name><last_name>" + paymentDataACH.lastName + "</last_name>" +
                "<email>" + paymentDataACH.emailId + "</email>" +
                "<company_name>IFG</company_name>" +
                "<address><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>CO</state><zip>" + paymentDataACH.zipCode + "</zip><country>US</country>" +
                "<phone nil='nil'/></address>" +
                "<billing_info type='bank_account'><address1>" + paymentDataACH.addressOne + "</address1><address2 nil='nil'/><city>" + paymentDataACH.city + "</city><state>CO</state><zip>" + paymentDataACH.zipCode + "</zip>" +
                "<country>US</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>" + paymentDataACH.accountName + "</name_on_account><account_type>" + paymentDataACH.accountType + "</account_type>" +
                "<account_number>" + paymentDataACH.accountNumber + "</account_number><company>OLIVE</company><routing_number type='integer'>" + paymentDataACH.routingNumber + "</routing_number></billing_info></account></transaction>";
            var url = "https://kids-discover-test.recurly.com/v2/transactions";
            var headers = {
                'Accept': 'application/xml',
                'Authorization': 'Basic '+encodedData
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


router.get('/', function(req, res) {
    res.send('responded');
});

module.exports = router;
