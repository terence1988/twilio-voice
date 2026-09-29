const VoiceResponse = require("twilio").twiml.VoiceResponse;

exports.welcome = function welcome() {
  const voiceResponse = new VoiceResponse();
  // the gather in welcome will call menu with digits
  const gather = voiceResponse.gather({
    action: "/ivr/menu",
    numDigits: "7",
    method: "POST",
    timeout: 45
  });

  gather.say(
    "Thanks for calling the Terence IVR demo. " +
      "Please press 8675309 to call Jenny.",
    { loop: 3 },
  );

  return voiceResponse.toString();
};

exports.menu = function menu(digit) {
  const optionActions = {
    8675309: callJenny,
  };

  return optionActions[digit] ? optionActions[digit]() : hangupCall();
};


/**
 * Returns a TwiML to interact with the client
 * @return {String}
 */
function callJenny() {
  const twiml = new VoiceResponse();

  twiml.say("Jenny is unavailable right now, please call back later.", {
    voice: "woman"
  });

  twiml.hangup()

  return twiml.toString();
}

/**
 * Returns an xml with the redirect
 * @return {String}
 */
function hangupCall() {
  const twiml = new VoiceResponse();

  twiml.say("I'm sorry, there's no Jenny at this number. Goodbye.", {
    voice: "man",
    language: "en-GB",
  });

  twiml.hangup()

  return twiml.toString();
}
