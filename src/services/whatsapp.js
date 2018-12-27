const axios = require('axios'); 
const config = require('./config');
const whatsapp = require('../routes/task/methods')


const API = config.apiwha.QNT.api;
const TOKEN = config.apiwha.QNT.token;

const headers = { 'Content-Type': 'application/x-www-form-urlencoded', "Access-Control-Allow-Origin": "*", };

exports.onMessage = (data) => {
    console.log(data)
    const msg = JSON.parse(data);
    let payload = { From: 'whatsapp:+' + msg.from, Body: msg.text, To: msg.to }
    return whatsapp.interaction(payload)
}

const sendMessage = ({number, text}) => {
    return new Promise((resolve, reject) => {
        axios({ url: `${API}/send_message.php?apikey=${TOKEN}&number=${number}&text=${text}`, headers })
        .then((response) => {
            response.data && resolve(response.data.description);
        })
        .catch((error) => {
            console.log(error)
            reject('error')
        });
    })
}

exports.sendMessage = sendMessage;