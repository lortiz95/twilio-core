const firebase = require('../services/firebase');

const Db = firebase.admin.firestore().collection('deudores');
const accountSid = 'AC0cb64b1b4e2aca8a0bc6e66449a164ee';
const authToken = '5dd867d1ff776ac5c61f5f5fc8b95504';

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;
const cron = require('node-cron');
const axios = require('axios');

const whatsappServices = require('../services/whatsapp');

const voiceConf = {
    language: 'es-ES',
    voice : 'alice'
}

exports.callConnect = function (req, res) {
    const response = new VoiceResponse();
    response.dial('+5440001975');
    response.say('Lo estamos conectado con el agente!');

    console.log(response.toString());
}


const checkDeudores = (req, res) => {
    let docs = []
    Db.get().then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            docs.push({ id: doc.id, ...doc.data() })
        })

        docs.map((item) => {
            client.calls.create({
                url: `https://twilio-corel.herokuapp.com/bot/deuda/${item.phone}`,
                to: item.phone,
                callerName: 'oneBank',
                from: '+541151686053'
            }).then(call => {
                console.log(call.sid)
            })
            
        })

        res.status(200).send({});
    })



}

exports.checkDeudores = checkDeudores;


exports.sendSMSRemider = (to, body) => {
    return client.messages.create({to, body, from: '+19282966472'}) 
}


exports.sendWpRemider = (to) => {
    let toSend = []
    to.map(({number, text}) => toSend.push(whatsappServices.sendMessage({ number: '+' + number, text })))
    return Promise.all(toSend)
}



// sendWpRemider('1132066451', 'Hola MAnuel').then((resolve) => {
//     console.log('====================================');
//     console.log(resolve);
//     console.log('====================================');
// })


// sendSMSRemider('+5491166959773', 'Federico le recordamos que su turno es el Martes 12 de Febrero a las 14:00. Con el doctor Rodigo Rodiguez, Cardiologia')





// client.studio.flows('FW090c435421f71638bd37e645b8e69754')
// .executions
// .create({to: '+541132066451', from: '+541151686053'})
// .then(execution => console.log(execution))
// .done();

