'use strict'

const config = require('../../services/config');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const { accountSid, authToken } = config.twilio;
const client = require('twilio')(accountSid, authToken);

const TWILIO_WORKSPACE_SID = 'WS69927d878405ad5ee52c7ede7ef7dc8f';
const TWILIO_WORKFLOW_SID = 'WWb51c8f5d8c4801ed5dd32b91bfb493a5';
const TWILIO_CHAT_SERVICE_SID = 'IS015edca31b264901ad0704be93a59df8';



exports.get = (req, res) => {
  
  let calls = []
  client.calls.each((call) => {
    calls.push(call);
  });

  res.status(200).send(calls)
  client.calls.list().then((call) => {
    console.log(call)
  })

  // client.recordings('REXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX')
  //     .fetch()
  //     .then(recording => console.log(recording.callSid))
  //     .done();

  
};

const getCalls = () => (
  new Promise((resolve, reject) => {
    let calls = [];
    client.calls.each((call) => {
      calls.push(call);
    });
  })
)
