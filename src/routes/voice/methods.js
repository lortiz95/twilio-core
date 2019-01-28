'use strict'

const config = require('../../services/config');
const { accountSid, authToken, appSid } = config.twilio;
const client = require('twilio')(accountSid, authToken);
const ClientCapability = require('twilio').jwt.ClientCapability;
const VoiceResponse = require('twilio').twiml.VoiceResponse;

const taskMethod = require('../task/methods');

exports.token = (req, res) => {

  const capability = new ClientCapability({
    accountSid: accountSid,
    authToken: authToken,
  });

  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: appSid})
  );

  const token = capability.toJwt();
  
  res.set('Content-Type', 'application/jwt');
  res.send(token);
}

exports.call = (req, res) => {
  // console.log(req.body)
  // let voiceResponse = new VoiceResponse();

  // voiceResponse.dial({ callerId: '+541151686170' }, '+541151686170');
  // res.type('text/xml');
  // res.send(voiceResponse.toString());

  client.calls.create({
    url: 'https://7da5f5b7.ngrok.io/api/voice/inbound',
    to: 'client:lortiz',
    from: '+541151686170'
  })
  .then(call => {
    console.log('call', call)
  })
}


exports.inboundCall = (req, res) => {
  
  let resp = new VoiceResponse();

  let json = {
    instruction: 'dequeue',
    to: 'client:lortiz',
    from: '+541151686170'
  }

  resp.say({language: 'es-ES'}, "Aguarde en linea y sera atendido por uno de nuestros representantes")
    
  resp.enqueue({
    workflowSid: 'WW5d761c97a82738b08e436eedb4761201'
    })
    .task({}, JSON.stringify(json))
  
  res.setHeader('Content-Type', 'application/xml');
  res.write(resp.toString());
  res.end();
}