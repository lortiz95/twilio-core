var admin = require("firebase-admin");

var serviceAccount = require("../config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://flex-core.firebaseio.com"
});

exports.admin = admin;