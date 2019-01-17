'use strict';

var methods = require("./methods");

module.exports = server => {

    server.post('/api/turismo/dni/:dni', methods.checkDoc);
    server.post('/api/turismo/dni', methods.checkDoc);

    server.post('/api/save/form', methods.saveForm)

    server.post('/api/save/chat', methods.saveChat)

    server.post('/api/save/client', methods.addClient)
    

    server.post('/api/health/dni', methods.checkDoc);
    server.get('/api/getDate', methods.getDate)
    server.post('/api/save/questions', methods.saveQuestion);

    server.get('/api/getTurn', methods.getTurn)

    server.post('/api/turismo/chat', methods.hadleData)
    
};
