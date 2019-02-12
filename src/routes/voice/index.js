'use strict';

var methods = require("./methods");

module.exports = server => {

	server.get('/api/voice/token', methods.token);
	server.post('/api/voice/token', methods.token);
	server.post('/api/voice/call', methods.call);
	server.post('/api/voice/conferenceStatus', methods.conferenceStatus);
	server.post('/api/voice/addToConference', methods.addParticipantConference);
	server.post('/api/getRecords', methods.getCallRecord);

};
