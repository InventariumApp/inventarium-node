var admin = require("firebase-admin");
var serviceAccount = require("/root/firebase_server_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://inventarium-36e42.firebaseio.com/"
});

var db = admin.database();
var listRef = db.ref("lists");

// ref.on("value", function(snapshot) {
// 	console.log(snapshot.val());
// });

exports.getPantryListForUser = function(userEmail) {
    admin.database().ref('lists/' + 'iphoneaccount@gmail,com').once('value').then(function(snapshot) {
        var pantryList = snapshot.val()['pantry-list'];
        var retVal = [];
        for(item in pantryList) {
            retVal.push(item);
        }
        console.log(retVal);
        return retVal;
    });
}

exports.getShoppingListForUser = function(userEmail) {
    admin.database().ref('lists/' + 'iphoneaccount@gmail,com').once('value').then(function(snapshot) {
        var shoppingList = snapshot.val()['shopping-list'];
        var retVal = [];
        for(item in shoppingList) {
            retVal.push(item);
        }
        console.log(retVal);
        return retVal;
    });
}

// admin.database().ref('lists/' + 'iphoneaccount@gmail,com').once('value').then(function(snapshot) {
//     var data = snapshot.val()['pantry-list'];
//     console.log('Firebase data: \n\n');
//     for(key in data) {
//         console.log(key);
//     }
// });


admin.database().ref('lists/' + 'iphoneaccount@gmail,com').once('value').then(function(snapshot) {
    var shoppingList = snapshot.val()['shopping-list'];
    var retVal = [];
    for(key in shoppingList) {
        retVal.push(key);
    }
    console.log(retVal);
    return retVal;
});