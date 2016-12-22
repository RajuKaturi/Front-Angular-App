"use strict"

const express = require('express');
const router = express.Router();
const User = require('../models/user');


/* GET api home page. */
// API to add user
router.post('/lead', (req, res) => {

    if (Object.keys(req.body).length === 0) {
        return res
            .status(422)
            .json({
                message: 'INVALID_BODY'
            });
    }

    let user = new User();

    user.firstName = req.body.firstName;
    user.lastName = req.body.lastName;
    user.email = req.body.email;
    user.isLocalLeader = req.body.isLocalLeader;

    user.save({}, function (err) {
        if (err) {
            res.send(err);
        }
        res.json({
            message: 'Leads added succesfully!', data: user
        });
    });

});

module.exports = router;