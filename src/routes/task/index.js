'use strict';

var methods = require("./methods");

module.exports = server => {

	server.post('/api/task', methods.task);

	server.post('/api/messages', methods.messages);

	server.get('/api/subscribe/:channel/:worker', methods.subscribe);

};
