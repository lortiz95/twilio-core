'use strict';

const methods = require("./methods");

module.exports = server => {

    // server.post('/api/video/token', methods.token);
    
	server.post('/api/taskrouter/:project/activity', methods.socket);

};


// http://afd5fa4a.ngrok.io/api/taskrouter/QNT/activity
// http://afd5fa4a.ngrok.io/api/taskrouter/DEMO/activity