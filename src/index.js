const express = require('express');
const axios = require('axios');
const app = express();
const EventEmitter = require("events");

const { sendMessage } = require('./sms');
const { config } = require('./config');
const {CowinSlots } = require('./CowinSlots');

const cowinSlots = new CowinSlots("Defined");
const globalEventObject = new EventEmitter();

globalEventObject.on("smsBody",(smsBody)=>{

    sendMessage(smsBody, "+12512782764", "+919515681995");
});

app.listen(3000, function() {
    
    console.log('Example app listening on port 3000!');
    setInterval(cowinSlots.getSlotsforDistrictID, 5000,'581',globalEventObject,cowinSlots);
});