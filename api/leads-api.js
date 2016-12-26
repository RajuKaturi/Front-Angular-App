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

    let user = new User({
        firstName: req.body.firstName || '',
        lastName: req.body.lastName   || '',
        email: req.body.email || '',
        isLocalLeader: req.body.isLocalLeader || '',
        pushToActOn: req.body.pushToActOn || false,
        pushToSalesForce: req.body.pushToSalesForce || false

    });

    user
        .save()
        .then(
            (lead) => {
                res.status(200).json({
                    "Message": "Leads added succesfully"
                })},
            (error) => {
                res.send(error);

            }
        );

});

module.exports = router;