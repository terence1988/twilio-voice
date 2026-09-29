// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
require('dotenv').config()
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const L2Q_FROM_NUMBER = process.env.L2Q_FROM_NUMBER;
const Q1_TO_NUMBER = process.env.Q1_TO_NUMBER;
const client = twilio(accountSid, authToken);

async function createCall() {
  const call = await client.calls.create({
    from: L2Q_FROM_NUMBER,
    to: Q1_TO_NUMBER,
    twiml: '<Response><Pause length="5"/><Say>Hello World</Say></Response>'
  });

  console.log(call.sid);
}

createCall();