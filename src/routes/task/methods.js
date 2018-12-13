'use strict'

const config = require('../../services/config');
const voiceResponse = require('twilio').twiml.VoiceResponse;

const { accountSid, authToken } = config.twilio;
const client = require('twilio')(accountSid, authToken);

const voiceMethod = require('../voice/methods');

exports.task = (req, res) => {
  client.taskrouter.workspaces('WS886a1106b77a255c9e30c6e823ca5931')
    .tasks
    .create({attributes: JSON.stringify({
      type: 'support',
      task_type: 'Voice',
    }), workflowSid: 'WW5d761c97a82738b08e436eedb4761201', taskChannel: 'SMS'})
    .then(task => console.log(task))
    .done();

  res.setHeader('Content-Type', 'application/xml');
  res.end()
}

