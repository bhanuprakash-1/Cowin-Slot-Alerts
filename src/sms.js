const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC52b18a85a5cbff366cf2a637f36ca26b";
const authToken = process.env.TWILIO_AUTH_TOKEN || "62450020532a05552c5989bf0fde1d5b";
const client = require('twilio')(accountSid, authToken);

var sendMessage = (body, from, to) => {

    client.messages
        .create({
            body: body,
            from: from,
            to: to
        })
        .then((message) => {
            console.log(message);
        })
        .catch((error) => {
            console.log(error);
            console.log("We got an error in sending sms ");
        })
}

exports.sendMessage = sendMessage;