'use strict';
var path = require('path');
var fs = require('fs');

module.exports = server => {
    fs.readdirSync(__dirname).forEach(folder => {
		if (fs.lstatSync(__dirname+"/"+folder).isDirectory()) {
			require("./"+folder)(server);
		}
    });
}
