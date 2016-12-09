var mongoose = require('mongoose');
//var mongoose = restful.mongoose;
//mongodb://localhost:27017/ifgather
var db = mongoose.createConnection('mongodb://devteamolive:Olive&devs08@iad2-c4-0.mongo.objectrocket.com:52208,iad2-c4-2.mongo.objectrocket.com:52208/ifg_users');

var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    isLocalLeader: Boolean
});


module.exports = db.model('ifgusers', userSchema); //Users
