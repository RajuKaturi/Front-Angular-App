'use strict';

require('colors');
const config = require('./config');
const winston = require('winston');

class Log {

  constructor() {
    this.logger = null;

    if (config.logging) {
      let loggingConfig = {
        transports: []
      };
      if (config.logging.transports) {
        if (!Array.isArray(config.logging.transports)) {
          console.log('Critical failure. Cannot start server because config file is invalid: '
            + 'logging.transports must be an array, if the configuration option is included'.red);

          process.exit(1);
        }

        for (let transport of config.logging.transports) {
          loggingConfig.transports.push(new (winston.transports[transport.type])(transport.options || {}));
        }

        try {
          this.logger = new (winston.Logger)(loggingConfig);
        } catch (err) {
          console.log(`Unable to start server due to configuration error: ${err}`.red);
          console.log(`Invalid configuration:\n ${config.logging}`.red);
        }
      }
    } else {
      console.log('Log configuration not found, defaulting to console logger'.yellow);
      
      this.logger = new (winston.Logger)({
        transports: [
          new (winston.transports.Console)(),
        ],
        "colorize": true,
        "level": "silly",
        "label": "IF-SERVER-LOG"
      });
    }

    this.logger.on('error', this.onErrorHandler);
  }

  onErrorHandler(err) {
    console.log('[Error Event Thrown]:'.red);
    console.log(err);
  }

  // logging level
  //********************************************************************************************************************
  error(err, msg) {
    this.logger.error(err, msg);
  }

  warn(msg) {
    this.logger.warn(msg);
  }

  info(msg) {
    this.logger.info(msg);
  }

  verbose(msg) {
    this.logger.verbose(msg);
  }

  debug(msg) {
    this.logger.debug(msg);
  }

  silly(msg) {
    this.logger.silly(msg);
  }
}


const log = new Log();
module.exports = log;
