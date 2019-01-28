'use strict'

const accountSid = '';
const authToken = '';

const firebase = require('../../services/firebase');

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const voiceConf = {
    language: 'es-ES',
    voice : 'alice'
}

exports.start = (req, res) => {
  console.log(req.body)
  let response = new VoiceResponse();

  response.say(voiceConf, 'Bienvenido a guan jelf')
  response.gather({
    input: 'dtmf speech',
    partialResultCallback: '/api/step/1',
    method: 'POST',
    hints: 'si,no,emergencia,ayuda',
    language: 'es-ES',
    maxSpeechTime: '3',
    timeout: '2500',
  }).say(voiceConf, 'Llama por una emergencia ?')
  
  
  res.send(response.toString());
}

exports.step1 = (req, res) => {
  let result = req.body.UnstableSpeechResult;
  let response = new VoiceResponse();

  if(result.search('si') > 0 || result.search('emergencia') > 0){
    console.log('====================================');
    console.log("EMERGENCIA 911");
    console.log('====================================');
    response.say(voiceConf, 'Estamos transfiriendolo a un agente');
    response.dial('+5491132066451');
    
  }
  else {
    console.log('====================================');
    console.log("TRNKA");
    console.log('====================================');
    response.say(voiceConf, 'Por favor ingrese su DNI')
    response.gather({
      input: 'dtmf',
      partialResultCallback: '/step/validateDoc',
      numDigits: "8",
      language: 'es-ES',
      maxSpeechTime: '3',
      timeout: '2500',
    }).say(voiceConf, 'Por favor ingrese su DNI')

    res.send(response.toString()); 
  }

}

exports.checkDoc = (req, res) => {
  console.log(req.body)

  // let result = req.body.UnstableSpeechResult;
  // let response = new VoiceResponse();

  // if(result.contains('si') || result.contains('emergencia')){
  //   response.say(voiceConf, 'Estamos transfiriendolo a un agente');
  //   response.dial('+5491132066451');
  //   res.send(response.toString());
  // }
  // else {
  //   response.gather({
  //     input: 'dtmf',
  //     action: '/step/validateDoc',
  //     numDigits: "8",
  //     language: 'es-ES',
  //     maxSpeechTime: '3',
  //     timeout: '2500',
  //   }).say(voiceConf, 'Por favor ingrese su DNI')
  // }

}


exports.botDeuda = (req, res) => {
  const Db = firebase.admin.firestore().collection('deudores');
  Db.where('phone', '==' ,req.params.phone).limit(1).get()
  .then((snapshot) => {
    let docs = []
    snapshot.docs.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() })
    })

    console.log('====================================');
    console.log(docs[0]);
    console.log('====================================');

    let deuda = docs[0].deuda;
    let response = new VoiceResponse();
    response.say(voiceConf, `
      Hola, nos comunicamos de guan bank para comunicarle que tiene una deuda de ${deuda} pesos. 
      Deberá regularizar el pago cuantó antes sea posible.
      Desde ya muchas gracias, que tenga buen día
    `)

    res.send(response.toString());
  })

    
}
