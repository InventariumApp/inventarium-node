
//TODO:  add user to the .indexOn in your security rules.
var admin = require("firebase-admin");
// Fetch the service account key JSON file contents
var serviceAccount = require("/root/firebase_account_key.json");
// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://inventarium-36e42.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("testingDB");

// Add an item to the given phoneNumber's list
module.exports.addItem = function(item, number, phoneNumber) {
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

// getItemsFromList = function(phoneNumber) {
//     var listsRef = ref.child("lists")
//     listsRef.orderByChild("owner").equalTo(phoneNumber).on("child_added", function(snapshot) {
//         listID = snapshot.key;
//         var itemsRef = ref.child("lists/" + listID)
//         console.log(snapshot.val())
//         var numItems = snapshot.numChildren();
//         console.log(numItems)
//         for (var i = 0; i < numItems; i++) {
//             console.log(snapshot.val()[i]);
//         }
//     });
// }

//createList(phoneNumbers.israelPhoneNumber)

//getItemsFromList("+16506819090");
