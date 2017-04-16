var config = require('./config');
var twilio = require('./twilioClient');
var phoneNumbers = require('./phone_numbers');
var database = require('./firebase');
var apiai = require("apiai");
var app = apiai(config.apiaiToken);
var aws = require('./aws.js');
var firebase = require('./firebase.js');
var twilioClient = require('./twilioClient');

exports.handleChatbotRequest = function(message, sessionId, phoneNumber) {
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

function doAction(action, item, userEmail, phoneNumber) {
    switch(action) {
        case 'removeItemFromShoppingList':
            removeItemFromShoppingList(item, userEmail);
            break;
        case 'addItemToShoppingList':
            addItemToShoppingList(item, userEmail);
            break;
        case 'addItemToPantryList':
            addItemToPantryList(item, userEmail);
            break;
        case 'removeItemFromPantryList':
            removeItemFromPantryList(item, userEmail);
            break;
        case 'showShoppingList':
            sendUsersShoppingList(userEmail, phoneNumber);
            break;
        case 'showPantryList':
            sendUsersPantryList(userEmail, phoneNumber);
            break;
        default:
            break;
    }
}

function sendUsersShoppingList(userEmail, phoneNumber) {
    firebase.getUsersList(userEmail, 'shopping-list').then(function(list) {
        twilioClient.sendSms(phoneNumber, list);
    });
}

function sendUsersPantryList(userEmail, phoneNumber) {
    firebase.getUsersList(userEmail, 'pantry-list').then(function(list) {
        twilioClient.sendSms(phoneNumber, list);
    });
}

function removeItemFromShoppingList(item, userEmail) {
    console.log("Deleting ", item, " from SHOPPING list");
    firebase.findShoppingListItemToRemove(userEmail, item).then(function(fullItemName) {
        if(fullItemName !== null) {
            firebase.removeItemFromShoppingList(userEmail, fullItemName);
        }
    });
}

function addItemToShoppingList(item, userEmail) {
    // first param is res... not needed here
    aws.getProductDataForName(undefined, item, userEmail, firebase.addItemToShoppingList);
}

function removeItemFromPantryList(item, userEmail) {
    console.log("Deleting ", item, " from PANTRY list");
    firebase.findPantryListItemToRemove(userEmail, item).then(function(fullItemName) {
        if(fullItemName !== null) {
            firebase.removeItemFromPantryList(userEmail, fullItemName);
        }
    });
}

function addItemToPantryList(item, userEmail) {
    // first param is res... not needed here
    aws.getProductDataForName(undefined, item, userEmail, firebase.addItemToPantryList);
}

function parseResponseAndKickoffAction(response, phoneNumber) {
    var responseResult = response.result;
    var responseSpeech = responseResult.fulfillment.speech;
    var responseItem = responseResult.parameters.item;
    var action = responseResult.action;
    var cleanPhoneNumber = phoneNumber.replace(/\+/g, "");
    console.log(cleanPhoneNumber);
    firebase.getUserEmailForUserPhoneNumber(cleanPhoneNumber).then(function(userEmail) {
        doAction(action, responseItem, userEmail, phoneNumber);
    });
    return responseSpeech;
};

exports.fulfillRequest = function(response) {
    console.log("ready to fulfill request");
    //parseResponseAndKickoffAction(request);
}