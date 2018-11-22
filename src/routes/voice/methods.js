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

  res.send({
    token: token,
  });

}

exports.call = (req, res) => {
  // if(req.body.CallSid) {
  //   taskMethod.task(req, res)
  // }
  let voiceResponse = new VoiceResponse();

  voiceResponse.dial({
    callerId: '+541151686170'
  }, req.body.number);

  res.send(voiceResponse.toString());
}
