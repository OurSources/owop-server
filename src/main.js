"use strict";

const Server = require("./server");

const server = new Server({
	port: 9000
});

module.exports = server;
