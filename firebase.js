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

exports.shareShoppingList = function(userEmail, phoneNumber, callback) {
    admin.database().ref('lists/' + userEmail).once('value').then(function(snapshot) {
        var shoppingList = snapshot.val()['shopping-list'];
        var shoppingListString = '';
        for(item in shoppingList) {
            console.log("Shopping item: ", item);
            shoppingListString = shoppingListString.concat(item);
            shoppingListString = shoppingListString.concat(", ");
        }
        shoppingListString = shoppingListString.substring(0, shoppingListString.length - 2);
        console.log("Shopping list string: ", shoppingListString);
        console.log(phoneNumber);
        callback(phoneNumber, shoppingListString);
    });
}

exports.shareWithPhoneNumber = function(userEmail, phoneNumber) {
    admin.database().ref('share-links/' + phoneNumber).set({
        "access-to": userEmail
    });
}

exports.getTopProductsForUser = function(userEmail) {
    return admin.database().ref('lists/' + userEmail + '/item-history').once('value').then(function(snapshot) {
        var allItems = snapshot.val();
        var itemCounts = {};
        for(k in allItems) {
            itemCounts[k] = getItemCount(allItems[k]);
        }

        var sortableCounts = [];
        for(item in itemCounts) {
            sortableCounts.push([item, itemCounts[item]]);
        }
        sortableCounts.sort(function(a, b) {
            return a[1] - b[1];
        });
        return sortableCounts;
    });
}

exports.addItemToShoppingList = function(userEmail, item, price, imageUrl) {
    return admin.database().ref('lists/' + userEmail + '/shopping-list/' + item).set({
        addedByUser: userEmail,
        count: 1,
        imageURL: imageUrl,
        name: item,
        price: price
    });
}

exports.addItemToPantryList = function(userEmail, item, price, imageUrl) {
    return admin.database().ref('lists/' + userEmail + '/pantry-list/' + item).set({
        addedByUser: userEmail,
        count: 1,
        imageURL: imageUrl,
        name: item,
        price: price
    });
}

exports.findShoppingListItemToRemove = function(userEmail, item) {
    return admin.database().ref('lists/' + userEmail + '/shopping-list/').once('value').then(function(snapshot) {
        var allItems = snapshot.val();
        var targetItem = null;
        for(currentItem in allItems) {
            if(currentItem.toLowerCase().includes(item.toLowerCase())) {
                targetItem = currentItem;
                console.log("Item to delete: ", targetItem);
                return targetItem;
            }
        }
        return targetItem;
    });
}

exports.findPantryListItemToRemove = function(userEmail, item) {
    return admin.database().ref('lists/' + userEmail + '/pantry-list/').once('value').then(function(snapshot) {
        var allItems = snapshot.val();
        var targetItem = null;
        for(currentItem in allItems) {
            if(currentItem.toLowerCase().includes(item.toLowerCase())) {
                targetItem = currentItem;
                console.log("Item to delete: ", targetItem);
                return targetItem;
            }
        }
        return targetItem;
    });
}

exports.removeItemFromShoppingList = function(userEmail, item) {
    return admin.database().ref('lists/' + userEmail + '/shopping-list/').child(item).remove();
}

exports.removeItemFromPantryList = function(userEmail, item) {
    return admin.database().ref('lists/' + userEmail + '/pantry-list/').child(item).remove();
}

exports.getUserEmailForUserPhoneNumber = function(phoneNumber) {
    return admin.database().ref('lists/').once('value').then(function(snapshot) {
       var allUsers = snapshot.val();
       for(user in allUsers) {
           var currentPhoneNumber = allUsers[user]['phone-number'];
           if(typeof currentPhoneNumber !== 'undefined') {
               if(phoneNumber.toString() === currentPhoneNumber.toString()) {
                   return user;
               }
           }
       }
       return null;
    });
}

exports.getUsersList = function(userEmail, listType) {
    return admin.database().ref('lists/' + userEmail + '/' + listType +'/').once('value').then(function(snapshot){
        var list = snapshot.val();
        var listString = '';
        for(item in list) {
            listString = listString.concat(item);
            listString = listString.concat(', ');
        }
        // get rid of trailing comma and space if we added items to the string
        if(listString !== '') {
            listString = listString.substring(0, listString.length - 2);
        }
        return listString;
    });
}

exports.getUserEmailForSharedUser = function(phoneNumber) {
    return admin.database().ref('share-links/' + phoneNumber + '/access-to').once('value').then(function(snapshot){
        var email = snapshot.val();
        console.log("Email for shared user: ", email);
        return email;
    });
}

exports.getItemCategoryCounts = function(userEmail) {
    return admin.database().ref('lists/' + userEmail + '/item-history/').once('value').then(function(snapshot) {
        var dict = {};
        snapshot.forEach(function (child) {
            var category = child.val().category;
            if (typeof dict[category] === 'undefined') {
                dict[category] = 1;
            }
            else {
                var count = dict[category];
                count++;
                dict[category] = count;
            }
        });
        console.log(dict);
        return dict;
    });
}


function getItemCount(itemHistory) {
    var count = 0;
    for(k in itemHistory) {
        count++;
    }
    return count;
}


// admin.database().ref('lists/' + 'iphoneaccount@gmail,com' + '/item-history/').once('value').then(function(snapshot){
//     var dict = {};
//     snapshot.forEach(function(child){
//         var category = child.val().category;
//         if(typeof dict[category] === 'undefined') {
//             dict[category] = 1;
//         }
//         else {
//             var count = dict[category];
//             count++;
//             dict[category] = count;
//         }
//     });
//     console.log(dict);
// });

