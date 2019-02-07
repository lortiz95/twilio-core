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

  // let accountSid = req.body.AccountSid;
  // let callSid = req.body.CallSid;
  // let workspaceSid = 'WS886a1106b77a255c9e30c6e823ca5931';
  
  console.log(req.body);

  let json = {
    type: 'social'
  }

  resp.enqueue({
    workflowSid: 'WW5d761c97a82738b08e436eedb4761201'
  }).task({}, JSON.stringify(json))

  res.setHeader('Content-Type', 'application/xml');
  res.write(resp.toString());
  res.end();

  client.taskrouter.workspaces().tasks.create
}


exports.inboundCall = (req, res) => {
  let from = JSON.parse(req.body.TaskAttributes).from;
  let eventType = req.body.EventType; 
  console.log(from);
  console.log(eventType);

  if (eventType === 'reservation.created' && from === 'client:Anonymous') {
    client.taskrouter.v1
      .workspaces(req.body.WorkspaceSid)
      .tasks(req.body.TaskSid)
      .reservations(req.body.ReservationSid)
      .update({
        instruction: 'conference',
        from: '+541151686170',
        endConferenceOnExit: true,
        startConferenceOnEnter: false,
        callAccept: false
      })
      .then(reservation => console.log('succes'))
      .catch(err => console.log('Error',err))
  }
  
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