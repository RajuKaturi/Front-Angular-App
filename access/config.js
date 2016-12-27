'use strict';

const config = require(`../config/${process.env.NODE_ENV || 'development'}.json`) || {};
config.NODE_ENV = process.env.NODE_ENV;

module.exports = config;
