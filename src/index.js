const express = require('express');
const axios = require('axios');
const app = express();
const EventEmitter = require("events");

const { sendMessage } = require('./sms');
const { config } = require('./config');
const {CowinSlots } = require('./CowinSlots');

const cowinSlots = new CowinSlots("Defined");
const globalEventObject = new EventEmitter();

const districtId = process.env.DISTRICT_ID || "581";
const port = process.env.PORT || 3000

globalEventObject.on("smsBody",(smsBody)=>{

    sendMessage(smsBody, "+12512782764", "+919515681995");
});

app.listen(port, function() {
    
    console.log('Example app listening on port '+port);
    setInterval(cowinSlots.getSlotsforDistrictID, 5000,districtId,globalEventObject,cowinSlots);
});