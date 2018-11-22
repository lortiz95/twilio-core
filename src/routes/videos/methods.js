'use strict';
let path = require('path');
const Twilio = require('twilio');
const TwilioClient = require('../../services/twilio');

const AccessToken = Twilio.jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;

const config = require('../../services/config');
const { accountSid, authToken, apiKey } = config.twilio;

exports.token = (req, res) => {
    const data = req.body;

    console.log(data)

    const token = new AccessToken(accountSid, apiKey, authToken)
    
    token.identity =  data.username;

    var grant = new VideoGrant();
    grant.room = data.room;
    token.addGrant(grant);

    const payload = { identity: token.identity, token: token.toJwt() };

    if (token) {
        console.log(payload)
        return res.status(200).send(payload);
    }
    else {
        console.log('ERROR - unable to create token')
        res.send(400).send('Unable to create token')
    }

};
