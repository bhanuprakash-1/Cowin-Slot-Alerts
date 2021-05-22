const express = require('express');
const axios = require('axios');
const app = express();

const { sendMessage } = require('./sms');
const { config } = require('./config');

var states = {}
var districtsOfStateId = {}

const headers = config.headers;

app.get('/', function(req, res) {

    axios
        .get(
            'https://cdn-api.co-vin.in/api/v2/admin/location/states', {
                headers
            }
        )
        .then((response) => {

            var state_objects = response.data.states;

            state_objects.forEach((object) => {
                console.log(object);
                states[object["state_id"]] = object["state_name"];
            })

            res.send(states);
            console.log(states);
        })
        .catch((err) => {
            res.send(err);
            console.log(err);
            console.log("error");
        })

});

app.get('/districts/:state_id', (req, res) => {

    axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/districts/' + req.params.state_id, {
            headers
        })
        .then((response) => {
            console.log(response.data.districts);
            res.send(response.data.districts);
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
})

const get_Slots = () => {

    axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict', {
            headers,
            params: {
                district_id: '581',
                date: '20-05-2021'
            }
        })
        .then((response) => {
            var centers = response.data.centers;
            var last_smsBody = "";
            var smsBody = "";

            centers.forEach((object) => {
                var temp_sessions = object.sessions;
                var temp_center = {};


                smsBody += "Fee type:" + object["fee_type"] + "\n";
                smsBody += "Hospital name:" + object["name"] + "\n";
                console.log("Fee type:" + object["fee_type"]);
                console.log("Hospital name:" + object["name"]);
                temp_sessions.forEach((sessions_object) => {

                    console.log(sessions_object["date"] + "   " + sessions_object["vaccine"] + " min age:" + sessions_object["min_age_limit"]);
                    console.log("No_of_Dose_1 :" + sessions_object["available_capacity_dose1"]);
                    console.log("No_of_Dose_2:" + sessions_object["available_capacity_dose2"]);

                    if (sessions_object["available_capacity_dose2"] > 0) {
                        smsBody += sessions_object["date"] + "   " + sessions_object["vaccine"] + " min age:" + sessions_object["min_age_limit"] + "\n";
                        smsBody += "No_of_Dose_2:" + sessions_object["available_capacity_dose2"] + "\n";
                    }

                })
                last_smsBody = smsBody;
            })

            sendMessage(smsBody, "+12512782764", "+919515681995")
        })
        .catch((err) => {
            console.log(err);
            // res.send(err)
        })


}

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');

    setInterval(get_Slots, 5000)
});