"use strict";

const CONFIG = require("./config/config.json");
const firebase = require("firebase-admin");

const key = require("./config/key.json");

firebase.initializeApp({
	credential: firebase.credential.cert(key),
	databaseURL: CONFIG.firebase.databaseURL
});

console.log("Initialized Firebase");
