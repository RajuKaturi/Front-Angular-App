"use strict"

let mongoose = require('mongoose');
let config = require('../config/config.json');
let db = mongoose.createConnection('mongodb://'+config.mongodb.username+':'+config.mongodb.password+'@'+config.mongodb.url+'/'+config.mongodb.db);

let userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    isLocalLeader: Boolean
});

module.exports = db.model('ifgusers', userSchema);
