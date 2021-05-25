const express = require('express');
const axios = require('axios');
const app = express();
const EventEmitter = require("events");

const { sendMessage } = require('./sms');
const { config } = require('./config');
const {CowinSlots } = require('./CowinSlots');

const globalEventObject = new EventEmitter();

const port = process.env.PORT || 3000

globalEventObject.on("smsBody",(smsBody,districtID)=>{

    sendMessage(smsBody, "+12512782764", "+919515681995",districtID);
});

setIntervalsForEachDistrictID = (districtIDs)=>{

    let cowinSlotsForDistrictID = {}
    
    districtIDs.forEach((districtId)=>{

        cowinSlotsForDistrictID[districtId] = new CowinSlots();
        console.log("District Id: "+districtId);
        setInterval(cowinSlotsForDistrictID[districtId].getSlotsforDistrictID, 10000, districtId, globalEventObject, cowinSlotsForDistrictID[districtId]);
    })

}

app.listen(port, function() {
    
    console.log('Example app listening on port '+port);

    let districtIDs = process.argv.slice(2);

    setIntervalsForEachDistrictID(districtIDs);

});