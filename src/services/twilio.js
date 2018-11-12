'use strict';

const twilio = require('twilio')
const config = require('./config');

const { accountSid, authToken } = config.twilio;
  
exports.client = new twilio(accountSid,authToken);
