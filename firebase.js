var admin = require("firebase-admin");
var serviceAccount = require("root/firebase_server_key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://inventarium-36e42.firebaseio.com/"
});
