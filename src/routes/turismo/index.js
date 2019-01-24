'use strict';

var methods = require("./methods");

module.exports = server => {

    server.post('/api/turismo/dni/:dni', methods.checkDoc);

    server.post('/api/turismo/dni', methods.checkDoc);
    
    server.post('/api/turismo/doc', methods.checkDNI);

    server.post('/api/turismo/phone', methods.checkPhone);

    server.post('/api/info/alojamiento', methods.infoAlojamiento);
    

    server.post('/api/save/form', methods.saveForm)

    
    server.post('/api/add/client', methods.addClient)


    server.post('/api/salud/dni', methods.getDocu);
    server.post('/api/save/salud/seguimiento', methods.saveQuestion);
    server.post('/api/save/salud/turno', methods.saveTurn);


    server.post('/api/save/client', methods.saveClient)


    server.post('/api/helpy/alert', methods.emergency)
    server.get('/api/helpy/alert', (req, res) => res.status(200).send('alert received!'))

    server.post('/response', (req, res) => {
        console.log('====================================');
        console.log(req.body);
        console.log('====================================');
        res.status(200).send('alert received!')
    })

    server.get('/response', (req, res) => {
        console.log('====================================');
        console.log(req);
        console.log('====================================');
        res.status(200).send('alert received!')
    })



    server.post('/api/send/remainer', methods.sendRemainer)


    
};
