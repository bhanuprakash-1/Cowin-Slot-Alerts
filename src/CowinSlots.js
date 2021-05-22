//sees if there are cowin slots for next 7 days, given the district id

const axios = require('axios');
const { response } = require('express');
const { config } = require('./config');

const headers = config.headers;

class CowinSlots{

    getSlotsforDistrictID(districtID,globalEventObject){

        const current_datetime = new Date()
        const formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()

        const params = {
            district_id: districtID,
            date       : formatted_date
        };

        axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict',{headers,params})
        .then((response)=>{

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

            console.log("Debug: Reached getSlotforDistrictID function");
            globalEventObject.emit("smsBody",smsBody);
        })
        .catch((error)=>{
            console.log(error);
            console.log("An error occured in fetching data from Cowin API");
        })
    }
}

module.exports = { CowinSlots };
