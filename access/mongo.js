"use strict";

let mongoose = require('mongoose');

let environment = process.env.NODE_ENV || 'development';

if (environment === 'development') {
    var config = require('../config/development.json');
}

const ifg_users_conn = mongoose.createConnection('mongodb://' + config.mongodb.username + ':' + config.mongodb.password + '@' + config.mongodb.url + '/' + config.mongodb.db);

function MongoDb() {
    let userSchema = new mongoose.Schema({
        firstName: String,
        lastName: String,
        email: String,
        isLocalLeader: Boolean,
        pushToActOn: Boolean,
        pushToSalesForce: Boolean
    });

    this.UserDb = ifg_users_conn.model('ifgusers', userSchema);
}

module.exports = MongoDb;
