var config = require('./config');
var twilio = require('./twilioClient');

module.exports.sendToChatbot = function(message, sessionId, phoneNumber, callback) {
    var apiai = require("apiai");
    var response;

    var app = apiai(config.apiaiToken);

    var options = {
        sessionId: sessionId
    }

    // Send message to API.AI and get response
    var request = app.textRequest(message, options);

    // On response, parse it and return it with callback
    request.on('response', function(response) {
        response = parseResponse(response);
        callback(response);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
};

// Parse the response
// TODO: Check for item is nil etc.
parseResponse = function(response) {
    var result = response.result;
    var speech = result.fulfillment.speech;
    var items = result.parameters.item
    var number = result.parameters.number
    console.log(response)
    console.log(items)
    console.log(number)
    //console.log("response ***")
    return speech;
};
