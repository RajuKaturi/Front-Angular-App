'use strict';

let mongoose = require('mongoose');
let environment = process.env.NODE_ENV || 'development';
if (environment === 'development') {
    var config = require('../config/development.json');
}

let ifg_users_conn = mongoose.createConnection(`mongodb://${config.mongodb.username}:${config.mongodb.password}@${config.mongodb.url}/${config.mongodb.db}`);

// CONNECTION EVENTS
// When successfully connected
ifg_users_conn.on('connected', function () {
    console.log('Mongoose default connection');
});
// If the connection throws an error
ifg_users_conn.on('error', function (err) {
    console.log('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
ifg_users_conn.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
});
// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
    ifg_users_conn.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});


module.exports = ifg_users_conn;

