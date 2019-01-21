'use strict'

const accountSid = '';
const authToken = '';

const firebase = require('../../services/firebase');
const moment = require('moment');

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const axios = require('axios');

const voiceConf = {
    language: 'es-ES',
    voice : 'alice'
}


let data = {
    '34347617' : {
        name: 'Federico'
    },
    '38991552' : {
        name: 'Federico'
    },
    '30883165' : {
        name: 'Ignacia'
    }
}


const settings = {/* your settings... */ timestampsInSnapshots: true};
firebase.admin.firestore().settings(settings);

let clientdb = firebase.admin.firestore().collection('clientes')


const getForm = (type, value) => (
  new Promise((resolve, reject) => (
    clientdb.where(type, "==", value).limit(1).get().then(snapshot => {
      let docs = []
      snapshot.forEach((doc => { docs.push(doc.data()) }))
      resolve(docs[0])
    }).catch((err) => {
      reject(err)
    }) 
  ))
)

exports.checkPhone = (req, res) => {
  getForm('phone', req.body.phone)
  .then(form => {
    res.status(200).send(form.name)
  })
  .catch(err => {
    res.status(200).send(null)
  })
}

exports.checkDoc = (req, res) => {
  let doc = req.body.doc;
  getForm('doc', doc)
  .then(form => {
    res.status(200).send(form.name)
  })
  .catch(err => {
    res.status(200).send(null)
  })
}

exports.checkDNI = (req, res) => {
  let doc = req.body.doc;
  getForm('doc', doc)
  .then(form => {
    res.status(200).send(form.name)
  })
  .catch(err => {
    res.status(502).send(null)
  })
}

exports.addClient = (req, res) => {
  let doc = req.body.doc;
  clientdb.doc(Number(req.body.phone).toString()).set(req.body)
  .then(() => {
    res.status(200).send(req.body.name)
  })
  .catch((err) => {
    res.status(500).send('err')
  })
  
    
}

exports.saveForm = (req, res) => {
  let data = req.body;
  console.log('====================================');
  console.log(data);
  console.log('====================================');
  clientdb.doc(Number(data.phone).toString()).collection('reviews').add({...data, medio : 'VoiceBot', fecha: moment().format('DD/MM/YY HH:mm:ss')}).then(() => {
    clientdb.doc(Number(data.phone).toString()).get().then(doc => {
      console.log('===============USER=====================');
      console.log(doc.data());
      console.log('====================================');
      emailService('oteroeiras@gmail.com', 'Iberoestar', 'Manuel Otero')
    })
    

    setTimeout(() => {
      res.send("saved")
    }, 2500);
  })
}
exports.infoAlojamiento = (req, res) => {
  let data = req.body;
  clientdb.doc(Number(data.phone).toString()).collection('reviews').add({...data, medio : 'VoiceBot', fecha: moment().format('DD/MM/YY HH:mm:ss')}).then(() => {
    clientdb.doc(Number(data.phone).toString()).get().then(doc => {
      console.log('===============USER=====================');
      console.log(doc.data());
      console.log('====================================');
      emailService('oteroeiras@gmail.com', 'Iberoestar', 'Manuel Otero')
    })
    

    setTimeout(() => {
      res.send("saved")
    }, 2500);
  })
}

exports.saveChat = (req, res) => {
  let data = req.body;
  console.log('====================================');
  console.log(data);
  console.log('====================================');
  res.status(200).send("success")
}


exports.getDate = (req, res) => {
  let msg = `La próxima cita disponible es Lunes ${new Date().getDate() + 7} de Enero a las 08:30 AM ¿Desea confirmarla?`
  res.status(200).send(msg)

}

exports.getTurn = (req, res) => {
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  res.status(200).send("msg")
}

exports.hadleData = (req, res) => {
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  res.status(200).send("msg")
}

exports.hadleData = (req, res) => {
  console.log('====================================');
  console.log(req.body);
  console.log('====================================');
  res.status(200).send("msg")
}


exports.sendEmail = (req, res) => {
  let {email, name, hotel} = req.body;
  const data = {
    "message" : {
      "to": [{ email }],
      "from_email": 'no-reply@insideone.com.ar',
      "from_name": 'One Turismo',
      "subject" : `OneTurismo - Alojamiento`
  },
  "template_name" : 'oneturismo-barcelona',
  "template_content" : [ { "name": "user_fullname",  "content": name }, { "name": "hotel",  "content": hotel }]
  }
  axios({ method: 'POST', url: 'https://service-delegator.herokuapp.com/send/email', data })
  .then((response) => {
    res.status(200).send('sended')
  }).catch((err) => {
    res.status(400).send('err')
  })
}

exports.saveQuestion = (req, res) => {
  console.log('===============QUESTIONS=====================');
  console.log(req.body);
  console.log('====================================');
  let {tomar, respirar, pulso, visita} = req.body;

  let description = `Durante la semana el paciente ${tomar === 'si' ? '' : 'no'} ha tomado su medicacion de forma regular,
  ${respirar === 'si' ? '' : 'no'} ha presentado dificultades para respirar y ${pulso === 'si' ? '' : 'no'} registro pulso irregular.
  Se le indico reservar una cita con un especialista el proximo mes`;

  console.log(description)
  
  res.status(200).send("")

}



const emailService = (email, hotel, name) => {
  const data = {
    "message" : {
      "to": [{ email }],
      "from_email": 'no-reply@insideone.com.ar',
      "from_name": 'One Turismo',
      "subject" : `OneTurismo - Alojamiento`
  },
  "template_name" : 'oneturismo-barcelona',
  "template_content" : [ { "name": "user_fullname",  "content": name }, { "name": "hotel",  "content": hotel }]
  }
  axios({ method: 'POST', url: 'https://service-delegator.herokuapp.com/send/email', data })
}