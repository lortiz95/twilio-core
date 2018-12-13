'use strict';

const dotenv      = require('dotenv').load();
const express     = require("express");
const bodyParser  = require("body-parser");
const app         = express();
const http        = require('http').Server(app);
const io          = require('socket.io')(http);
const cors        = require('cors');

const PORT = process.env.PORT || 8080

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

app.use(cors())

app.post('/twilio', (req, res) => {
    console.log(req.body);

    res.status(200).send('Bienvenido Manuel');
})


app.post('/response', (req, res) => {
    console.log(req.body);

    res.status(200);
})

require('./src/routes')(app);

require('./src/services/socket').run(io);

http.listen(PORT, ()=>{
    console.log('====================================');
    console.log("App is running on: ", PORT);
    console.log('====================================');
});

exports = module.exports = app;
