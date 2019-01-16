'use strict';

var methods = require("./methods");
var cron = require("../../cron/index");

module.exports = server => {

    server.post('/api/medicine', methods.start);

    server.post('/bot/deuda/:phone', methods.botDeuda);
    
    server.post('/api/step/1', methods.step1);
    
    server.post('/api/step/validateDoc', methods.checkDoc);
    

	server.get('/api/cron/deudores', cron.checkDeudores);


};
