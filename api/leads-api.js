'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');

/* GET api home page. */
// API to add user
router.post('/lead', postLead);

module.exports = router;

//////////
function postLead(req, res) {

  if (Object.keys(req.body).length === 0) {
    return res
      .status(422)
      .json({
        message: 'INVALID_BODY'
      });
  }

  delete req.body._id; // make sure the client isn't injecting it's own id
  let user = new User(req.body);

  user
    .save()
    .then((lead) => {
      res.status(200).json({message: 'Leads added succesfully'});
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({message: 'DB_ERROR'});
    });
}
