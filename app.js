var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var request = require('request');

var index = require('./routes/index');
// var users = require('./routes/users');
var api = require('./routes/api');

var app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/users', users);
app.use('/api',api);

app.post('/recurly', function (req, res) {

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
            "<address><address1>"+paymentData.addressOne+"</address1><address2 nil='nil'><city>"+paymentData.city+"</city><state>CO</state><zip>"+paymentData.zipCode+"</zip><country>US</country>" +
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
            'Authorization': 'Basic N2E0YTI3OTY3ZDY3NGQ2ODg1OTIzOTMzYmNlZjEyZmQ='
        } ;
        request.post({ url: sub_url,body: sub_body,headers: sub_headers}, function(error, response, body) {
            if(error){
                return error;
            } else {
                if(response.statusCode === 201){

                    return res.json({'msg': 'success'});
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
            'Authorization': 'Basic N2E0YTI3OTY3ZDY3NGQ2ODg1OTIzOTMzYmNlZjEyZmQ='
        } ;
        request.post({ url: url,body: body,headers: headers}, function(error, response, body) {
            if(error){
                return response.json(error);
            } else {
                console.log(response.body);
                if(response.statusCode === 201){

                    return res.json({'msg': 'success'});
                }

            }
        });
    }

});

app.post('/ach', function (req, res) {

    var paymentDataACH = req.body;

    if(paymentDataACH.monthlyGiving) {
        var sub_body = "<subscription href='https://kids-discover-test.recurly.com/v2/subscriptions' type='bank_account'>" +
            "<plan_code>ifgmonthlysb</plan_code>" +
            "<unit_amount_in_cents type='integer'>"+paymentDataACH.amount+"</unit_amount_in_cents>" +
            "<currency>USD</currency>" +
            "<account><account_code>"+paymentDataACH.emailId+"</account_code><first_name>"+paymentDataACH.firstName+"</first_name><last_name>"+paymentDataACH.lastName+"</last_name>" +
            "<email>"+paymentDataACH.emailId+"</email>" +
            "<company_name>ifgathering</company_name>" +
            "<address><address1>"+paymentDataACH.addressOne+"</address1><address2 nil='nil'/><city>"+paymentDataACH.city+"</city><state>CO</state><zip>"+paymentDataACH.zipCode+"</zip><country>US</country>" +
            "<phone nil='nil'/></address>"+
            "<billing_info type='credit_card'><address1>"+paymentDataACH.addressOne+"</address1><address2 nil='nil'/><city>"+paymentDataACH.city+"</city><state>CO</state><zip>"+paymentDataACH.zipCode+"</zip>" +
            "<country>US</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>"+paymentDataACH.accountName+"</name_on_account><account_type>"+paymentDataACH.accountType+"</account_type>" +
            "<account_number>"+paymentDataACH.accountNumber+"</account_number><company>OLIVE</company><routing_number type='integer'>"+paymentDataACH.routingNumber+"</routing_number></billing_info></account></subscription>";
        var sub_url = "https://kids-discover-test.recurly.com/v2/subscriptions";
        var sub_headers = {
            'Accept': 'application/xml',
            'Authorization': 'Basic N2E0YTI3OTY3ZDY3NGQ2ODg1OTIzOTMzYmNlZjEyZmQ='
        } ;
        request.post({ url: sub_url,body: sub_body,headers: sub_headers}, function(error, response, body) {
            if(error){
                return error;
            } else {
                if(response.statusCode === 201){
                    return res.json({'msg': 'success'});
                }
            }
        });

    } else {

        var AccountUrlACH = "https://kids-discover-test.recurly.com/v2/accounts/"+paymentDataACH.emailId;

        var body = "<transaction href='https://kids-discover-test.recurly.com/v2/transactions' type='bank_account'>" +
            "<account href='"+AccountUrlACH+"'/><amount_in_cents type='integer'>"+paymentDataACH.amount+"</amount_in_cents>" +
            "<currency>USD</currency><payment_method>ACH</payment_method>" +
            "<account><account_code>"+paymentDataACH.emailId+"</account_code><first_name>"+paymentDataACH.firstName+"</first_name><last_name>"+paymentDataACH.lastName+"</last_name>" +
            "<email>"+paymentDataACH.emailId+"</email>" +
            "<company_name>IFG</company_name>" +
            "<address><address1>"+paymentDataACH.addressOne+"</address1><address2 nil='nil'/><city>"+paymentDataACH.city+"</city><state>CO</state><zip>"+paymentDataACH.zipCode+"</zip><country>US</country>" +
            "<phone nil='nil'/></address>"+
            "<billing_info type='bank_account'><address1>"+paymentDataACH.addressOne+"</address1><address2 nil='nil'/><city>"+paymentDataACH.city+"</city><state>CO</state><zip>"+paymentDataACH.zipCode+"</zip>" +
            "<country>US</country><phone nil='nil'/><vat_number nil='nil'/><name_on_account>"+paymentDataACH.accountName+"</name_on_account><account_type>"+paymentDataACH.accountType+"</account_type>" +
            "<account_number>"+paymentDataACH.accountNumber+"</account_number><company>OLIVE</company><routing_number type='integer'>"+paymentDataACH.routingNumber+"</routing_number></billing_info></account></transaction>";
        var url = "https://kids-discover-test.recurly.com/v2/transactions";
        var headers = {
            'Accept': 'application/xml',
            'Authorization': 'Basic N2E0YTI3OTY3ZDY3NGQ2ODg1OTIzOTMzYmNlZjEyZmQ='
        } ;
        request.post({ url: url,body: body,headers: headers}, function(error, response, body) {
            if(error){
                return error;
            } else {
                if(response.statusCode === 201){
                    return res.json({'msg': 'success'});
                }
            }
        });
    }

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(req, res, next) {
  res.Header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With,X-Auth-Token');
  res.header('Access-Control-Allow-Methods', 'GET','POST','DELETE,PUT','OPTIONS');
  next();
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
