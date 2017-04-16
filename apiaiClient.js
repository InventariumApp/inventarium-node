var config = require('./config');
var twilio = require('./twilioClient');
var phoneNumbers = require('./phone_numbers');
var database = require('./firebase');
var apiai = require("apiai");
var app = apiai(config.apiaiToken);
var aws = require('./aws.js');
var firebase = require('./firebase.js');
var twilioClient = require('./twilioClient');

exports.sendRequestToChatbot = function(message, sessionId, phoneNumber) {
    var options = {
        sessionId: sessionId
    }
    // Send message to API.AI and get response
    var request = app.textRequest(message, options);
    // On response, parse it and return it with callback
    request.on('response', function(response) {
        var responseSpeech = parseResponseAndKickoffAction(response, phoneNumber);
        // text user the speech resut from api.ai
        twilioClient.sendSms(phoneNumber, responseSpeech);
    });
    request.on('error', function(error) {
        console.log(error);
    });
    request.end();
};

function doAction(action, item, userEmail) {
    switch(action) {
        case 'removeItemFromShoppingList':
            removeItemFromShoppingList(item, userEmail);
        case 'addItemToShoppingList':
            addItemToShoppingList(item, userEmail);
        case 'addItemToPantryList':
        case 'removeItemFromPantryList':
        case 'getShoopingListItems':
        default:
            break;
    }
}

function removeItemFromShoppingList() {

}

function addItemToShoppingList(item, userEmail) {
    // first param is res... not needed here
    aws.getProductDataForName(undefined, item, userEmail, firebase.addItemToShoppingList);
}

// Parse the response
// TODO: Check for item is nil etc.
// TODO: Pull out database interaction into another method
function parseResponseAndKickoffAction(response, phoneNumber) {
    var responseResult = response.result;
    var responseSpeech = responseResult.fulfillment.speech;
    var responseItem = responseResult.parameters.item;
    var action = responseResult.action;
    var cleanPhoneNumber = phoneNumber.replace(/\+/g, "");
    console.log(cleanPhoneNumber);
    firebase.getUserEmailForUserPhoneNumber(cleanPhoneNumber).then(function(userEmail) {
        doAction(action, responseItem, userEmail);
    });
    return responseSpeech;
};