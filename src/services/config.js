'use strict';

const path = require('path');
const dotenv = require('dotenv');

dotenv.load();

const all = {
	env: process.env.NODE_ENV || 'development',

	root: path.normalize(__dirname + '/..'),

	port: process.env.PORT || 8080,

	// Server IP
	ip: process.env.IP || '0.0.0.0',

	secret: process.env.SECRET,

	// Twilio API tokens
	twilio: {
		accountSid: process.env.TWILIO_ACCOUNT_SID,
		authToken: process.env.TWILIO_AUTH_TOKEN,
		appSid: process.env.TWILIO_TWIML_APP_SID,
		apiKey:  process.env.API_KEY,
		workspaceSid: process.env.WORSPACE_SID,
		workflowSid: process.env.WORFLOW_SID,
	}

};

module.exports = all;
