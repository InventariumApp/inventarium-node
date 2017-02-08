var config = require('./config');
var twilio = require('./twilioClient');
var phoneNumbers = require('./phone_numbers');

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
        addItem(response_items[i], num, phoneNumber);
    }
    // console.log(response)
    // console.log(items)
    // console.log(number)
    //console.log("response ***")
    return response_speech;
};


//**** FIREBASE STUFF **** <---- Will most likely move later...
//TODO:  add user to the .indexOn in your security rules.
var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./serviceAccountKey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://inventarium-36e42.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("testingDB");

addItem = function(item, number, phoneNumber) {
    var listsRef = ref.child("lists")
    listsRef.orderByChild("owner").equalTo(phoneNumber).on("child_added", function(snapshot) {
        listID = snapshot.key;
        var itemsRef = ref.child("lists/" + listID)
        itemsRef.push({
            item: item,
            number: number
        })
    });
}

createList = function(phoneNumber) {
    var listsRef = ref.child("lists")
    listsRef.push({
        owner: phoneNumber
    });
}

//createList(phoneNumbers.israelPhoneNumber)
