'use strict';
let path = require('path');
const Twilio = require('twilio');

exports.socket = (req, res) => {
    const client = req.params.project;
    const data = req.body;

    console.log('====================================');
    console.log({client, data});
    console.log('====================================');

    res.status(200).send({})

};
