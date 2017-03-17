'use strict';

const express = require('express');
const log = require('../access/log');
const router = express.Router();
const User = require('../models/user');


/* GET api home page. */
// API to add user
router.post('/lead', postLead);

module.exports = router;

function postLead(req, res) {

  if (Object.keys(req.body).length === 0) {
    log.info(`INVALID_BODY: ${JSON.parse(req.body)}`);

    return res
      .status(422)
      .json({
        message: 'INVALID_BODY'
      });
  }

  delete req.body._id; // make sure the client isn't injecting it's own id
  let user = new User(req.body);

  user
    .isEmailExists()
    .then((response) => {
      if (response.length !== 0) {
        user
          .update(response[0]._id)
          .then((data) => {
            log.debug('Record Updated Succesfully');

            res.status(200).json({message: "Record Updated Succesfully"});
          })
          .catch((err) => {
            log.error(err);

            res.status(500).json({message: 'DB_ERROR ON UPDATE'});
          });
      } else {
        user
          .save()
          .then((lead) => {
            log.debug('leads added succesfully');

            res.status(200).json({message: 'Leads added succesfully'});
          })
          .catch((err) => {
            log.error(err);

            res.status(500).json({message: 'DB_ERROR_ON_SAVE'});
          });
      }
    })
    .catch((err) => {
      log.error(err);

      res.status(500).json({message: err});
    });
}
