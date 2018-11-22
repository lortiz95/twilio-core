'use strict';

var methods = require("./methods");

module.exports = server => {

	server.post('/api/voice/token', methods.token);
	server.post('/api/voice/call', methods.call);

};
