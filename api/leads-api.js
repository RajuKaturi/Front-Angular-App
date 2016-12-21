const express = require('express');
const router = express.Router();
const User = require('../models/user');


/* GET api home page. */
// API to add user
router.post('/addLead',function(req, res){
    var userInst = new User();
    if(Object.keys(req.body).length === 0 ){
        res.json({"Message" : "Sorry, Please send some data!"});
    } else {
        userInst.firstName = req.body.firstName;
        userInst.lastName = req.body.lastName;
        userInst.email = req.body.email;
        userInst.isLocalLeader = req.body.isLocalLeader;

        userInst.save({},function(err){
            if(err){
                res.send(err);
            }
            res.json({
                message: 'Leads added succesfully!', data: userinst
            });
        });

    }
});

module.exports = router;