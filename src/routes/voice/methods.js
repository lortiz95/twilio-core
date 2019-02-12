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

  capability.addScope(new ClientCapability.IncomingClientScope('lucas'));

  const token = capability.toJwt();
  
  res.set('Content-Type', 'application/jwt');
  res.send(token);
}



exports.call = (req, res) => {
  let resp = new VoiceResponse();
  
  console.log(req.body);

  resp.dial().conference({
    beep: true,
    startConferenceOnEnter: true,
    endConferenceOnExit: true,
    maxParticipants: 3,
    statusCallback: 'https://5697c659.ngrok.io/api/voice/conferenceStatus',
    statusCallbackEvent: 'start end join leave mute hold'
  }, 'RoomTest')

  res.setHeader('Content-Type', 'application/xml');
  res.write(resp.toString());
  res.end();
}


exports.conferenceStatus = (req, res) => {
  let resp = new VoiceResponse();
  let data = req.body;

  if(req.body.SequenceNumber == 1) {
    client.taskrouter
      .workspaces('WS886a1106b77a255c9e30c6e823ca5931')
      .tasks
      .create({
        attributes: JSON.stringify({
          account_sid: req.body.AccountSid,
          direction: 'inbound',
          call_sid: req.body.CallSid,
          conference: {
            sid: req.body.ConferenceSid
          }
        }), workflowSid: 'WW5d761c97a82738b08e436eedb4761201', taskChannel: 'default'
      })
      .then(task => console.log(task.sid))
      .catch(err => console.log(err))
      .done();
  }
  console.log('Status',data);

  res.setHeader('Content-Type', 'application/xml');
  res.write(resp.toString());
  res.end();
}

exports.addParticipantConference = (req, res) => {
  console.log(req.body);

  client.conferences(req.body.conferenceSid)
    .participants.create({
      to: req.body.worker,
      from: req.body.from,
      earlyMedia: true,
      endConferenceOnExit: true
    })
  
  res.status(200)
  res.end();
}


exports.getCallRecord = (req, res) => {
  let records = [];
  const toFetch = []
  
  client.recordings.list().then(recordings => {
    console.log(recordings.length)
    let record = {};
    recordings.map(dataRecord => toFetch.push(client.calls(dataRecord.callSid).fetch().then(call => ({
      id: dataRecord.sid,
      from: call.from,
      to: call.to,
      duration: dataRecord.duration,
      dateInit: dataRecord.dateCreated,
      dateEnd: call.endTime,
      accountSid: dataRecord.accountSid
    }))))
    console.log(toFetch)
    Promise.all(toFetch).then(resp => {
      console.log(resp)
      res.send(resp)
      res.status(200)
      res.end()
    }).catch(err => console.log(err))
  });
}