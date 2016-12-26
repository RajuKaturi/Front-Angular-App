'use strict';

let mongoose = require('mongoose');
let conn = require('../access/mongo');

let userSchema = mongoose.Schema ({
                    firstName: { type: String, required: true},
                    lastName: { type: String, required: true},
                    email: { type: String, required: true},
                    isLocalLeader: Boolean,
                    pushToActOn: Boolean,
                    pushToSalesForce: Boolean

                 });

// Add custom methods


// generate model
const userModel = conn.model('ifg_leads', userSchema);


//export model
module.exports = userModel;
