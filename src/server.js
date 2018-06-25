"use strict";

const WebSocket = require("ws");
const IdManager = require("./id_manager");

require("./auth");

const { Protocol } = require("./protocol");
const WorldManager = require("./world_manager");

const Client = require("./client");

class Server {
	constructor(options) {
		this.clients = new Set();

		this.protocol = new Protocol();
		this.worldManager = new WorldManager();
		this.idManager = new IdManager(); /* Per world or global? */

		this.server = new WebSocket.Server({
			port: options.port
		}, () => {
			console.log("Server started!");
		});

		this.server.on("connection", (socket, data) => {
			let client = new Client(socket, this.protocol, this.worldManager);

			this.clients.add(client);
			socket.on("close", () => {
				this.clients.delete(client);
			});
			socket.on("error", () => {});
		});

		this.server.on("error", () => {

		});
	}

	broadcast(message) {
		this.clients.forEach(client => client.send(message));
	}
}

module.exports = Server;
