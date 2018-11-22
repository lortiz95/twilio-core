'use strict';

var methods = require("./methods");

module.exports = server => {

	server.post('/api/task', methods.task);

};
