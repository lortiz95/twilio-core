'use strict';

var methods = require("./methods");

module.exports = server => {

	server.post('/api/message/recive', methods.OnRecive);

	server.post('/api/message/send', methods.OnSend);

};