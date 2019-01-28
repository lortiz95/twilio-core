'use strict'

const accountSid = '';
const authToken = '';

const firebase = require('../../services/firebase');
const moment = require('moment');

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const cron = require('../../cron');

const axios = require('axios');

const voiceConf = {
    language: 'es-ES',
    voice : 'alice'
}


const settings = {timestampsInSnapshots: true};
firebase.admin.firestore().settings(settings);

let clientdb = firebase.admin.firestore().collection('clientes')
let pacientsdb = firebase.admin.firestore().collection('pacientes')
let alerts = firebase.admin.firestore().collection('alerts')

const confirmResponse = (param) => param.toLowerCase() == 'si' || param.toLowerCase() === 'sí' || param.toLowerCase().search('si')|| param.toLowerCase().search('sí') ? true : false;

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

const getDoc = (type, value) => (
  new Promise((resolve, reject) => (
    pacientsdb.where(type, "==", value).limit(1).get().then(snapshot => {
      let docs = []
      snapshot.forEach((doc => { docs.push({id: doc.id, ...doc.data()}) }))
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

exports.addClient = (req, res) => {
  let doc = req.body.doc;
  clientdb.doc(Number(req.body.phone).toString()).set(req.body)
    .then(() => { res.status(200).send(req.body.name) })
      .catch((err) => { res.status(500).send('err') })
}

exports.saveForm = (req, res) => {
  let data = req.body;
  clientdb.doc(Number(data.phone).toString()).collection('reviews').add({...data, medio : 'VoiceBot', fecha: moment().format('DD/MM/YY HH:mm:ss')}).then(() => {
    res.send("saved");
  })
}

exports.infoAlojamiento = (req, res) => {
  let data = req.body;
  clientdb.doc(Number(data.phone).toString()).collection('reviews').add({...data, medio : 'VoiceBot', fecha: moment().format('DD/MM/YY HH:mm:ss')}).then(() => {
    clientdb.doc(Number(data.phone).toString()).get().then(doc => {
      let user = doc.data();
      if(user && user.email){ emailService(user.email, data.establecimiento, user.name + user.lastname)}
      res.send("saved")
    })
  })
}

// Salud

exports.getDocu = (req, res) => {
  let doc = req.body.doc;
  getDoc('doc', doc)
  .then(form => { res.status(200).send(form.name) })
    .catch(err => { res.status(502).send(null) })
}

exports.saveQuestion = (req, res) => {
  let {tomar, respirar, pulso, visita, doc} = req.body;

  let descripcion = `Durante la semana el paciente ${confirmResponse(tomar) ? '' : 'no'} ha tomado su medicación de forma regular,
  ${confirmResponse(respirar) ? '' : 'no'} ha presentado dificultades para respirar y ${confirmResponse(pulso) ? '' : 'no'} registró pulso irregular.
  Se le indicó reservar una cita con un especialista el próximo mes.`;

  let fecha = moment().format('DD/MM hh:mm')
  let medio = 'Bot';
  let especialidad = 'Cardiología'

  getDoc('doc', doc).then(doc => {
    pacientsdb.doc(doc.id).collection('seguimiento').add({ fecha, medio, especialidad, descripcion }).then(() => {
      res.status(200).send("added seguimiento")
    })
  })
  
}

exports.saveTurn = (req, res) => {
  let {doc, fecha, especialidad} = req.body;
  getDoc('doc', doc).then(data => {
    pacientsdb.doc(data.id).collection('citas').add({ fecha, especialidad }).then(() => {
      res.status(200).send("added cita")
    })
  })
}


// Collab 
exports.checkDNI = (req, res) => {
  let doc = req.body.doc;
  getForm('doc', doc)
  .then(form => { res.status(200).send(form.name) })
    .catch(err => { res.status(502).send(null) })
}

exports.saveClient = (req, res) => {
  clientdb.doc(Number(req.body.phone).toString()).set(req.body)
    .then(() => { res.status(200).send(req.body.name) })
      .catch((err) => { res.status(500).send('err') })
}


// Helpy
exports.emergency = (req, res) => {
  console.log(req.body)
  alerts.add(req.body).then((response) => {
    res.status(200).send('Emergency added')
  }).catch(err => {
    res.status(404).send('Error');
  })
  // let {doc, descripcion, canal, fecha, ubicacion} = req.body;
  // let payload = {descripcion, canal, fecha: moment().format('DD/MM/YY HH:mm:ss'), ubicacion};
  // addEmergency(doc, payload).then(()=> {
  //   res.status(200).send('Emergency added')
  // }).catch((err) => {
  //   console.log('====================================');
  //   console.log(err);
  //   console.log('====================================');
  // })
}

const addEmergency = (doc, data) => {
  return getDoc('doc', doc)
  .then((response) => {
    return pacientsdb.doc(response.id).collection('emergencias').add(data)
  })
}


// Remainer

const emailreminder = (email, hotel, name) => {
  const data = {
    "message" : {
      "to": [{ email }],
      "from_email": 'no-reply@insideone.com.ar',
      "from_name": 'One Health',
      "subject" : `OneHealth - Turno`
  },
  "template_name" : 'onehealth-recordatorio-turno',
  "template_content" : [ { "name": "name",  "content": name }, { "name": "hotel",  "content": hotel }]
  }
  axios({ method: 'POST', url: 'https://service-delegator.herokuapp.com/send/email', data })
}

exports.sendRemainer = (req, res) => {
  let { doc } = req.body;
  getDoc('doc', doc).then((user) => {
    pacientsdb.doc(user.id).collection('contactos').get().then(snapshot => {
      let contacts = [];
      snapshot.docs.forEach(doc => {
        contacts.push({ number: doc.data().phone, text: `Hola ${doc.data().nombre} le recordamos que ${user.name} tiene una cita el dia 12 de Febrero.` });
      })
      setTimeout(() => {
        cron.sendWpRemider(contacts).then((response) => {
          res.status(200).send('success')
        }).catch((err) => {
          res.status(500).send('err')
        })
      }, 1500);
    }).catch(err => {
      res.status(500).send('err')
    })
  })
}