"use strict"

const MongoDb = require('../access/mongo');

module.exports = User;

function User(init) {

    this.firstName = init.firstName || '';
    this.lastName = init.lastName || '';
    this.email = init.email || '';
    this.isLocalLeader = init.isLocalLeader || '';
    this.pushToActOn = init.pushToActOn || '';
    this.pushToSalesForce = init.pushToSalesForce || '';
}

User.prototype.save = save;

function save() {

    return new Promise((resolve, reject) => {
        let db = new MongoDb();
        let userDb = new db.UserDb(this);

        userDb.save((err) => {
            if(err) {
                return reject(err);
            }

            resolve(this);
        });
    });
}
