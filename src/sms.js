const accountSid = process.env.TWILIO_ACCOUNT_SID || "";
const authToken = process.env.TWILIO_AUTH_TOKEN || " ";
const client = require('twilio')(accountSid, authToken);

var sendMessage = (body, from, to,districtID) => {

    client.messages
        .create({
            body: body,
            from: from,
            to: to
        })
        .then((message) => {
            console.log("Debug: SMS Sent Successfully for district id "+ districtID + " , with sid: "+message["sid"]);
        })
        .catch((error) => {
            console.log(error);
            console.log("We got an error in sending sms ");
        })
}

module.exports = { sendMessage };