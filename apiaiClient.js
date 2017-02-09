var config = require('./config');
var twilio = require('./twilioClient');
var phoneNumbers = require('./phone_numbers');
var database = require('./database');

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
        response = parseResponse(response, phoneNumber);
        callback(response);
    });

    request.on('error', function(error) {
        console.log(error);
    });

    request.end();
};

// Parse the response
// TODO: Check for item is nil etc.
// TODO: Pull out database interaction into another method
parseResponse = function(response, phoneNumber) {
    var response_result = response.result;
    var response_speech = response_result.fulfillment.speech;
    var response_items = response_result.parameters.item
    var response_number = response_result.parameters.number
    for (var i=0; i < response_items.length; i++){
        num = 1;
        // if response_number.length < i {
        //     num = response_number[i];
        // }
        database.addItem(response_items[i], num, phoneNumber);
    }
    // console.log(response)
    // console.log(items)
    // console.log(number)
    //console.log("response ***")
    return response_speech;
};