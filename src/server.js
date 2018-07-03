"use strict";

const fs = require("fs");
const WebSocket = require("ws");
const http = require("http");
const IdManager = require("./id_manager");

require("./auth");

const WorldManager = require("./world_manager");

const Client = require("./client");

class Server {
	constructor(options) {
		this.clients = new Set();

		this.worldManager = new WorldManager();
		this.idManager = new IdManager(); /* Per world or global? */

		// WebSocket Server
		this.server = new WebSocket.Server({
			port: options.port
		}, () => {
			console.log("Server started!");
		});

		this.server.on("connection", (socket, data) => {
			let client = new Client(socket, this.worldManager);

			this.clients.add(client);
			socket.on("close", () => {
				this.clients.delete(client);
			});
			socket.on("error", () => {});
		});

		this.server.on("error", () => {

		});


		// HTTP Chunk Server
		const chunksPath = "worlds";

		this.chunkServer = http.createServer(function(req, res) {
			let exists = fs.existsSync(chunksPath + req.url);

			if (exists) {
				res.end(fs.readFileSync(chunksPath + req.url), "binary");
			} else {
				res.writeHead(404, {});
				res.end();
			}
		});

		this.chunkServer.on("clientError", function(err, socket) {
			socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
		});

		this.chunkServer.listen(options.chunkPort);
	}

	broadcast(message) {
		this.clients.forEach(client => client.send(message));
	}
}

module.exports = Server;
