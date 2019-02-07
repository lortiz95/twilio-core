var admin = require("firebase-admin");
var serviceAccount = require("../config.json");

const service = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://flex-core.firebaseio.com"
});

const settings = {timestampsInSnapshots: true};
const firestore = admin.firestore().settings(settings);


exports.firestore = firestore;
exports.admin = service;