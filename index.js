import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";
import { welcome, menu } from "./handler.js";
import "dotenv/config";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const VoiceResponse = twilio.twiml.VoiceResponse;

// Initialize Twilio client with credentials from your Twilio Console
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twlPhoneNumber = process.env.TWILIO_NUMBER;
const client = twilio(accountSid, authToken);

const ALICE_NUMBER = process.env.ALICE_NUMBER; // Target destination for Alice
const BOB_NUMBER = process.env.BOB_NUMBER; // Target destination for Bob
const SERVER_URL = "https://twilio-voice-ashen.vercel.app";

app.get("/", (req, res) => {
  res.json({ message: "APP is running on Vercel!" });
});

app.get("/click-to-call", (req, res) => {
  res.json({ message: "APP is running on Vercel!" });
});

// Create a route that will handle Twilio webhook requests, sent as an
// HTTP POST to /voice in our application
app.post("/voice", (request, response) => {
  // Use the Twilio Node.js SDK to build an XML response
  const twiml = new VoiceResponse();

  twiml.say("Hello from your pals at Twilio! Have fun.");

  // Render the response as XML in reply to the webhook request
  response.type("text/xml");
  response.send(twiml.toString());
});

// 2. ROUTE: Triggers the outbound call to your cell phone
app.post("/click-to-call", (req, res) => {
  const userNumber = req.body.userNumber;

  const response = new twilio.twiml.VoiceResponse();

  // Gather expects the user to press 1 digit.
  // Once pressed, it sends that digit to the action URL.
  const gather = response.gather({
    numDigits: 1,
    action: `${SERVER_URL}/handle-key`,
    method: "POST",
  });

  gather.say("Press 1 to call Alice or Press 2 to call Bob.");

  // Fallback if the user doesn't press anything in time
  response.say("We did not receive any input. Goodbye.");

  client.calls
    .create({
      to: userNumber, // The user's phone number from the form
      from: twlPhoneNumber, // Your Twilio phone number
      // URL providing TwiML instructions when the user answers
      twiml: response.toString(),
    })
    .then((call) => {
      console.log(`Call initiated successfully. SID: ${call.sid}`);
      res.status(200).send("Connecting your call now!");
    })
    .catch((error) => {
      console.error(`Failed to create call: ${error.message}`);
      res.status(500).send("Error initiating call.");
    });
});

// 3. ROUTE: Processes the keypad selection ("1" or "2") from the call
app.post("/handle-key", (req, res) => {
  const digitPressed = req.body.Digits;
  const twiml = new twilio.twiml.VoiceResponse();

  if (digitPressed === "1") {
    twiml.say("Connecting you to Alice.");
    twiml.dial(ALICE_NUMBER);
  } else if (digitPressed === "2") {
    twiml.say("Connecting you to Bob.");
    twiml.dial(BOB_NUMBER);
  } else {
    // Handle invalid buttons gracefully by repeating the menu
    twiml.say("Invalid selection.");
    const gather = twiml.gather({
      numDigits: 1,
      action: `${SERVER_URL}/handle-key`,
      method: "POST",
    });
    gather.say("Press 1 to call Alice or Press 2 to call Bob.");
  }

  res.type("text/xml");
  res.send(twiml.toString());
});

// POST: /ivr/welcome
app.post('/ivr/welcome', (req, res) => {
  res.send(welcome());
});

// POST: /ivr/menu
app.post('/ivr/menu', (req, res) => {
  const digit = req.body.Digits;
  res.send(menu(digit));
});

// Create an HTTP server and listen for requests on port 1337
app.listen(3000, () => {
  console.log("TwiML server running at port 3000");
});
