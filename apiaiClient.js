var config = require('./config');
var twilio = require('./twilioClient');

module.exports.sendToChatbot = function(message, sessionId, phoneNumber) {
    var apiai = require("apiai");
    var response;

    var app = apiai(config.apiaiToken);

    var options = {
        sessionId: sessionId
    }

    var request = app.textRequest(message, options);

    request.on('response', function(response) {
        response = parseResponse(response);
        twilio.sendSms(phoneNumber, response);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
};

parseResponse = function(response) {
  var speech = response.result.fulfillment.speech;
  return speech;
};
