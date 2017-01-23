'use strict';

require('colors');
const app = require('express')();
const bodyParser = require('body-parser');
const config = require('./access/config');
const cors = require('cors');
const debug = require('debug')('ifgather:server');
const express = require('express');
const favicon = require('serve-favicon');
const helmet = require('helmet');
const http = require('http');
const mongo = require('./access/mongo');
const logger = require('morgan');
const path = require('path');
const request = require('request');
const routes = require('./api');

new Main();

/**
 * @constructor
 */
function Main() {
  app.use(cors());
  app.use(helmet());

  // port
  let configPort = (config.server || {}).port || null;
  let port = normalizePort(process.env.PORT || configPort || '3000');
  app.set('port', port);

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');

  // uncomment after placing your favicon in /public
  // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use('/api', routes);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With,X-Auth-Token');
    res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'DELETE,PUT', 'OPTIONS');
    next();
  });

  // error handler
  app.use((err, req, res, next) => {
    console.log(err);

    if (process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'local') {
      res.status(err.status || 500).json({
        error: err.message,
        stack: err.stack
      });
    } else {
      res.status(500).json({error: 'INTERNAL_SERVER_ERROR'});
    }
  });

  console.log('starting mongodb');
  mongo
    .open()
    .then(() => {
      this.server = http.createServer(app);
      this.server.listen(port);
      this.server.on('error', onError.bind(this));
      this.server.on('listening', onListening.bind(this));
    })
    .catch((err) => {
      console.log('Unable to start server due to MonoDb initialization error'.red);
      console.error(err);
    });
}

Main.prototype.onError = onError;
Main.prototype.normalizePort = normalizePort;
Main.prototype.onListening = onListening;

//////////
/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`.red);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`.red);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = this.server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('IF Gathering Server');
  console.log('Brought to you by Olive Technology, Inc.'.blue);
  console.log('http://www.OliveTech.com'.blue);
  console.log(`...server started on ${bind} with NODE_ENV: ${config.NODE_ENV}`.green);
  debug('Listening on ' + bind);
}
