'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const winston = require('winston');

winston.level = 'error';
winston.level = 'info';

/* GET api home page. */
// API to add user
router.post('/lead', postLead);

module.exports = router;

function postLead(req, res) {
  try {
    var logfile = './access/leadLogs.log';
  }
  catch (error) {
    winston.error('LEAD_LOG_FILE_NOT_FOUND');
  }

  winston.configure({
    transports: [
      new (winston.transports.File) ({ filename: logfile})
    ]
  });

  if (Object.keys(req.body).length === 0) {
    winston.error('INVALID_BODY');
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
       if(response.length !== 0) {
          user
            .update(response[0]._id)
            .then((data) => {
              winston.info('Record Updated Succesfully');
              res.status(200).json({message: "Record Updated Succesfully"});
            })
            .catch((err) => {
              winston.error('message:',err);
              res.status(500).json({message: 'DB_ERROR ON UPDATE'});
            })
       } else {
          user
            .save()
            .then((lead) => {
              winston.info('leads added succesfully');
              res.status(200).json({message: 'Leads added succesfully'});
            })
            .catch((err) => {
              winston.error('message:',err);
              res.status(500).json({message: 'DB_ERROR ON SAVE'});
            });
       }
    })
    .catch((err) => {
      winston.error('message:',err);
      res.status(500).json({message: err});
    })
}
