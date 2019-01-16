const firebase = require('../services/firebase');

const Db = firebase.admin.firestore().collection('deudores');
const accountSid = 'AC0cb64b1b4e2aca8a0bc6e66449a164ee';
const authToken = '5dd867d1ff776ac5c61f5f5fc8b95504';

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const voiceConf = {
    language: 'es-ES',
    voice : 'alice'
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
