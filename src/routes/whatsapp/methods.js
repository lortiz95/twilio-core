'use strict'


const whatsappServices = require('../../services/whatsapp');



exports.OnRecive = function(req, res) {
  whatsappServices.onMessage(req.body.data)
  .then((response) => {
    res.status(200).send({})
  })
  .catch((err) => {
    res.status(500).send(err)
  })
}

exports.OnSend = function(req, res) {
  let toSend = []
  let pref = req.body.pref
  let numbers = req.body.To.split(',');
  numbers.map((num) => toSend.push(whatsappServices.sendMessage({ number: pref + num, text: req.body.Body })))
  Promise.all(toSend)
  .then((response) => {
    res.status(200).send({})
  })
  .catch((err) => {
    res.status(500).send(err)
  })
}
