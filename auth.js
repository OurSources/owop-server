'use strict';
const CONFIG = require(`./config`);
const firebase = require(`firebase-admin`);

firebase.initializeApp({
	credential: firebase.credential.cert(require("./config/key.json")),
	databaseURL: CONFIG.firebase.databaseURL
});

console.log(`Initialized Firebase`);
