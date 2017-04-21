var config = require('./config');
var twilio = require('./twilioClient');
var phoneNumbers = require('./phone_numbers');
var database = require('./firebase');
var apiai = require("apiai");
var app = apiai(config.apiaiToken);
var aws = require('./aws.js');
var firebase = require('./firebase.js');
var twilioClient = require('./twilioClient');
const DEMO_EMAIL = 'iphoneaccount@gmail,com';

exports.handleChatbotRequest = function(message, sessionId, phoneNumber) {
    var options = {
        sessionId: sessionId
    }
    // Send message to API.AI and get response
    var request = app.textRequest(message, options);
    // On response, parse it and return it with callback
    request.on('response', function(response) {
        parseResponseAndKickoffAction(response, phoneNumber);
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
    console.log("SMS from: ", cleanPhoneNumber);
    firebase.getUserEmailForUserPhoneNumber(cleanPhoneNumber).then(function(userEmail) {
        // if no email returned, check if this is a phone number of a shared user
        if(userEmail === null) {
            firebase.getUserEmailForSharedUser(cleanPhoneNumber).then(function(email) {
                if(email !== null) {
                    console.log(cleanPhoneNumber, " is a shared user.");
                    // user is a shared user
                    sendTwilioApiaiResponse(cleanPhoneNumber, responseSpeech);
                    setTimeout(function(){
                        doAction(action, responseItem, email, cleanPhoneNumber);
                    }, 1000);
                }
                else {
                    sendTwilioNoListResponse(cleanPhoneNumber);
                }
            });
        }
        else {
            // user is owner of the list
            sendTwilioApiaiResponse(cleanPhoneNumber, responseSpeech);
            doAction(action, responseItem, userEmail, cleanPhoneNumber);
        }
    });
    return responseSpeech;
};

exports.fulfillRequest = function(apiaiResponse, res) {
    console.log("Fulfilling Api.Ai request...");
    var action = apiaiResponse.result.action;
    doWebhookAction(action, apiaiResponse, res);
}

/**
 * uses our default user email for Demo purposes
 * @param action
 * @param res
 */
function doWebhookAction(action, ivanResponse, res) {
    console.log("Performing action: ", action);
    switch(action) {
        case 'removeItemFromShoppingList':
            removeItemFromShoppingListWebhook(ivanResponse, res);
            break;
        case 'addItemToShoppingList':
            addItemToShoppingListWebhook(ivanResponse, res);
            break;
        case 'addItemToPantryList':
            addItemToPantryListWebhook(ivanResponse, res);
            break;
        case 'removeItemFromPantryList':
            removeItemFromPantryListWebhook(ivanResponse, res);
            break;
        case 'showShoppingList':
            sendUsersShoppingListWebhook(ivanResponse, res);
            break;
        case 'showPantryList':
            sendUsersPantryListWebhook(ivanResponse, res);
            break;
        default:
            break;
    }
}

function removeItemFromShoppingListWebhook(ivanResponse, res) {
    removeItemFromShoppingList(ivanResponse.result.parameters.item, DEMO_EMAIL);
    buildAndSendApiAiResponse(ivanResponse.fulfillment.speech, res);
}

function addItemToShoppingListWebhook(ivanResponse, res) {
    addItemToShoppingList(ivanResponse.result.parameters.item, DEMO_EMAIL);
    buildAndSendApiAiResponse(ivanResponse.result.fulfillment.speech, res);
}

function addItemToPantryListWebhook(ivanResponse, res) {
    addItemToPantryList(ivanResponse.result.parameters.item, DEMO_EMAIL);
    buildAndSendApiAiResponse(ivanResponse.result.fulfillment.speech, res);
}

function removeItemFromPantryListWebhook(ivanResponse, res) {
    removeItemFromPantryList(ivanResponse.result.parameters.item, DEMO_EMAIL);
    buildAndSendApiAiResponse(ivanResponse.result.fulfillment.speech, res);
}

function sendUsersShoppingListWebhook(ivanResponse, res) {
    firebase.getUsersList(DEMO_EMAIL, 'shopping-list').then(function(list) {
        if(list === '') {
            var speech = 'you do not have anything on your shopping list';
            buildAndSendApiAiResponse(speech, res);
        }
        else {
            var grammarCorrectString = addAndToList(list);
            buildAndSendApiAiResponse('You need to buy ' + grammarCorrectString, res);
        }
    });
}

function sendUsersPantryListWebhook(ivanResponse, res) {
    firebase.getUsersList(DEMO_EMAIL, 'pantry-list').then(function(list) {
        if(list === '') {
            var speech = 'you do not have anything in your pantry';
            buildAndSendApiAiResponse(speech, res);
        }
        else {
            var grammarCorrectString = addAndToList(list);
            buildAndSendApiAiResponse('You currently have ' + grammarCorrectString, res);
        }
    });
}

function buildAndSendApiAiResponse(speech, res) {
    console.log("Responding with speech: ", speech);
    var data = {};
    data['speech'] = speech;
    res.json(data);
}


// TWILIO UTIL RESPONSE WRAPPERS

function sendTwilioNoListResponse(phoneNumber) {
    twilioClient.sendSms(phoneNumber, 'Sorry, you do not have access to any lists.');
}

function sendTwilioApiaiResponse(phoneNumber, responseSpeech) {
    twilioClient.sendSms(phoneNumber, responseSpeech);
}

function addAndToList(listString) {
    var i = 0;
    var items = listString.split(",");
    var retVal = '';
    while(i < items.length) {
        if(i === items.length - 2) {
            // at item before last item. Write 'item, and '
            retVal = retVal.concat(items[i]);
            retVal = retVal.concat(', and ');
        }
        else if(i === items.length - 1) {
            // at last item, just write the item. 'and' is already in place
            retVal = retVal.concat(items[i]);
        }
        else {
            // everything else
            retVal = retVal.concat(items[i]);
            retVal = retVal.concat(', ');
        }
        i++;
    }
    return retVal;
}
