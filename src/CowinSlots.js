//sees if there are cowin slots for next 7 days, given the district id

const axios = require('axios');
const { response } = require('express');
const { config } = require('./config');

const headers = config.headers;

class CowinSlots{

    constructor(data){
        this.slots = {};
        this.test = data;
    }

    objectsAreEqual = (obj1,obj2)=>{
        const obj1Length = Object.keys(obj1).length;
        const obj2Length = Object.keys(obj2).length;
  
        if (obj1Length === obj2Length) {
            return Object.keys(obj1).every(
                key => obj2.hasOwnProperty(key)
                    && obj2[key] === obj1[key]);
        }
        return false;
    }

    arraysAreEqual = (a,b)=>{
        return ( a.length === b.length && a.every((v, i) => v === b[i]) );
    }

    generateSMSBody = (centers)=>{
        
        let smsBody = "";

        for(let center in centers){
            
            smsBody += "\n\nHospital_Name: " + center;
            
            for(let date in centers[center]){

                smsBody += "\nDate:" + centers[center][date]["date"];
                smsBody += "\nVaccine:" + centers[center][date]["vaccine"];
                smsBody += "\nMin_Age_Limit:" + centers[center][date]["min_age_limit"];
                smsBody += "\n Dose_1:" + centers[center][date]["available_capacity_dose1"];
                smsBody += "\n Dose_2:" + centers[center][date]["available_capacity_dose2"];
            }
        }

        return smsBody;
    }

    getSlotsforDistrictID(districtID,globalEventObject,cowinSlotsObject){

        var thisObject = cowinSlotsObject;
        const current_datetime = new Date();
        const formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear();

        const params = {
            'district_id': districtID,
            'date': formatted_date
        };

        axios.get('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict',{headers,params})
        .then((response)=>{

            let centers = response.data.centers;
            let last_smsBody = "";
            let smsBody = "";
            let tempSlots = {};

            centers.forEach((object)=>{

                let tempSessions = object.sessions;

                tempSessions.forEach((sessionsObject)=>{

                    // writing code for only second dose availability
                    if(sessionsObject["available_capacity_dose2"]>0){
                        if(!tempSlots.hasOwnProperty(object["name"])){
                             tempSlots[object["name"]] = {};
                        }
                        tempSlots[object["name"]][sessionsObject["date"]]=sessionsObject;
                    }
                })
            })

            let smsToBeSent = false;

            for(let tempCenter in tempSlots){
                let keyOfTempCenter = tempCenter;
                
                if(thisObject.slots.hasOwnProperty(keyOfTempCenter) === false){
                    thisObject.slots = tempSlots; // send sms message, coz new key (i.e, new center) is added, meaning new vaccine slots available.
                    smsToBeSent = true;
                    break;
                }
                else if(thisObject.objectsAreEqual(thisObject.slots,tempSlots) === false){
                    /* the value for given center key is different in latest and previous object, this can be because of 
                     1) new session(s) is/are available (i.e, new vaccine slots available) --- in this case, need to send SMS
                     2)number of vaccines decreased in a one or more sessions or a session object removed( when no_doses <=0)---- no need to send SMS

                    */
                    for(const tempSession in tempSlots[tempCenter]){
                        let keyOfTempSession = tempSession;

                        if(thisObject.slots[keyOfTempCenter].hasOwnProperty(keyOfTempSession) === false){
                            // this implies that new date/ session is/are available-- need to send SMS
                            thisObject.slots = tempSlots;
                            smsToBeSent = true;
                            break; // break in outer loop too
                        }
                        else if(thisObject.objectsAreEqual(thisObject.slots[keyOfTempCenter][keyOfTempSession],tempSlots[tempCenter][keyOfTempSession]) === false){
                            //session data changes between current and previous, can be because of vaccine doses decrease or something else
                            thisObject.slots[keyOfTempCenter][keyOfTempSession] = tempSlots[tempCenter][keyOfTempSession];
                        }
                    }

                    if(smsToBeSent === true){
                        break;
                    }
                    //for case where session is there in previous but not there in current.
                    let keysOfSessionsPrevious = Object.keys(thisObject.slots[keyOfTempCenter]);
                    let keysOfSessionsPresent = Object.keys(tempSlots[tempCenter]);

                    if(thisObject.arraysAreEqual(keysOfSessionsPrevious,keysOfSessionsPresent) === false){
                        thisObject.slots[keyOfTempCenter] = tempSlots[tempCenter];
                    }
                }

            }
            
            
            // for cases where centers are there in previous but not there in current
            let keysOfCentersPrevious = Object.keys(thisObject.slots);
            let keysOfCentersPresent  = Object.keys(tempSlots);

            if(thisObject.arraysAreEqual(keysOfCentersPresent,keysOfCentersPrevious) === false ){
                thisObject.slots = tempSlots;
            }

            if(smsToBeSent === true){
                // write a function to prepare smsbody;
                console.log("Debug: SMS is being sent");
                let smsBody = thisObject.generateSMSBody(thisObject.slots);
                globalEventObject.emit("smsBody",smsBody);

            }
            else{
                console.log("Debug: SMS not to be sent");
            }
        })
        .catch((error)=>{
            console.log(error);
            console.log("An error occured in fetching data from Cowin API");
        })
    }
}

module.exports = { CowinSlots };
