var admin = require("firebase-admin");
var serviceAccount = require("./Firebase_server_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://nifty-acolyte-159120.firebaseio.com/"
});

var db = admin.database();
var listRef = db.ref("lists");

// ref.on("value", function(snapshot) {
// 	console.log(snapshot.val());
// });

exports.getPantryListForUser = function(userEmail) {
    var data = [];
    admin.database().ref('lists/' + userEmail).once('value').then(function(snapshot) {
        var pantryList = snapshot.val()['pantry-list'];
        var retVal = [];
        for(item in pantryList) {
            retVal.push(item);
        }
        console.log(retVal);
        data = retVal;
    });
    console.log(data);
    return data;
}

exports.getShoppingListForUser = function(userEmail) {
    admin.database().ref('lists/' + userEmail).once('value').then(function(snapshot) {
        var shoppingList = snapshot.val()['shopping-list'];
        var retVal = [];
        for(item in shoppingList) {
            retVal.push(item);
        }
        console.log(retVal);
        return retVal;
    });
}

// var data = [];
// admin.database().ref('lists/' + 'iphoneaccount@gmail,com').once('value').then(function(snapshot) {
//     var pantryList = snapshot.val()['pantry-list'];
//     var retVal = [];
//     for(item in pantryList) {
//         retVal.push(item);
//     }
//     console.log(retVal);
//     data = retVal;
// });

admin.database().ref('share-links/' + '11111111111').set({
    'access-to': 'test@gmail,com'
});


