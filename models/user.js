var mongoose = require('mongoose');
//var mongoose = restful.mongoose;
var db = mongoose.createConnection('mongodb://localhost:27017/ifgather');

var userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    isLocalLeader: Boolean
});


module.exports = db.model('Users', userSchema);