'use strict';
import CONFIG from "./config";
import firebase from "firebase-admin";

import key from "./config/key.json";

firebase.initializeApp({
	credential: firebase.credential.cert(key),
	databaseURL: CONFIG.firebase.databaseURL
});

console.log("Initialized Firebase");
