var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET api home page. */
// API to add user
router.post('/addLead',function(req, res){
    var userinst = new User();
    if(Object.keys(req.body).length === 0 ){
        res.json({"Message" : "Sorry Buddy, Please send some data!"});
    } else {
        userinst.firstName = req.body.firstName;
        userinst.lastName = req.body.lastName;
        userinst.email = req.body.email;
        userinst.isLocalLeader = req.body.isLocalLeader;

        userinst.save({},function(err){
            if(err){
                res.send(err);
            }
            res.json({
                message: 'Leads added succesfully!', data: userinst
            });
        });

    }
});

router.get('/', function(req, res, next) {
    res.send('responded');
});

module.exports = router;