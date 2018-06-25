"use strict";

const Server = require("./server");

const server = new Server({
	port: 9000,
	chunkPort: 4334
});

module.exports = server;
