'use strict';

var methods = require("./methods");

module.exports = server => {

	server.get('/api/calls', methods.get);

};
