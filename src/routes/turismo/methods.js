'use strict'

const accountSid = '';
const authToken = '';

const firebase = require('../../services/firebase');
const moment = require('moment');

const client = require('twilio')(accountSid, authToken);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

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


const getForm = (doc) => (
  new Promise((resolve, reject) => (
    clientdb.where('doc', "==", doc).limit(1).get().then(snapshot => {
      let docs = []
      snapshot.forEach((doc => { docs.push(doc.data()) }))
      resolve(docs[0])
    }).catch((err) => {
      reject(err)
    }) 
  ))
)

exports.checkDoc = (req, res) => {
  let doc = req.body.doc;
  getForm(doc)
  .then(form => {
    res.status(200).send(form.name)
  })
  .catch(err => {
    res.status(200).send(null)
  })
}

exports.checkDNI = (req, res) => {
  let doc = req.body.doc;
  getForm(doc)
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
  clientdb.doc(Number(data.phone).toString()).collection('reviews').add({...data, medio : 'VoiceBot', fecha: moment().format('DD/MM/YY HH:mm:ss')}).then(() => {
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

exports.saveQuestion = (req, res) => {
  console.log('===============QUESTIONS=====================');
  console.log(req.body);
  console.log('====================================');
  
  res.status(200).send("")

}
