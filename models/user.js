var mongoose = require('mongoose');

//Username:devteamolive
//Password:Olive&devs08
//Database:ifg_users
//Mongo url:iad2-c4-2.mongo.objectrocket.com:52208
//Collection: ifgusers
var db = mongoose.createConnection('mongodb://devteamolive:Olive&devs08@iad2-c4-2.mongo.objectrocket.com:52208/ifg_users');

var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    isLocalLeader: Boolean
});


module.exports = db.model('ifgusers', userSchema);
