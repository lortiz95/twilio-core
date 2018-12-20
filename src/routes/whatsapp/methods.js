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
