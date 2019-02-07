'use strict';

var methods = require("./methods");

module.exports = server => {

	server.get('/api/voice/token', methods.token);
	server.post('/api/voice/token', methods.token);
	server.post('/api/voice/inbound', methods.inboundCall);
	server.post('/api/voice/call', methods.call);
	server.post('/api/getRecords', methods.getCallRecord);

};
