'use strict';

var methods = require("./methods");

module.exports = server => {

	server.get('/api/plugins', methods.getPlugins);

};