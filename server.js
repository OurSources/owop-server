'use strict';
const WebSocket = require(`ws`);
const HashMap = require(`./utils/hashmap`);
const World = require(`./world`);
const Player = require(`./player`);
const auth = require(`./auth`);
const Proto = require(`./protocol`);

var server = new WebSocket.Server({ port: 9000 }, () => console.log(`Server started!`));
var worlds = new HashMap();
var players = new HashMap();
var totalOnline = 0;

let clients = [];

function broadcast(message) {
	for (let i in clients) {
		clients[i].send(message);
	}
}

class Client {
	constructor(socket) {
		this.socket = socket;

		this.protoState = Proto.States.LOGIN;

		this.socket.on("message", (data) => {
			if (typeof data == "string") {
				this.close();
			}

			let packet;
			try {
				packet = Proto.deserialize(data, this.protoState);
			} catch(e) {
				console.log("invalid packet!", e);
				return;
			}

			console.log(packet);

			switch(this.protoState) {
				case Proto.States.LOGIN:
					switch(packet.name) {
						case "loginStart":
							console.log("BOB ;( " + packet.params.bob);
							break;
					}
					break;
				case Proto.States.PLAY:
					switch(packet.name) {

					}
					break;
			}
		});

		this.id = clients.push(this) - 1;

		console.log("connection start: " + this.id);
	}

	close() {
		this.socket.close();
		delete clients[this.id];
	}
}

server.on(`connection`, (socket, data) => {
	let client = new Client(socket);
});

setInterval(() => {
	worlds.forEach((key, world) => world.sendUpdates());
}, 50);

function getWorld(worldName) {
	if (worlds.contains(worldName)) {
		return worlds.get(worldName);
	} else {
		var world = new World(worldName);
		worlds.add(worldName, world);
		return world;
	}
}

function unloadWorld(worldName) {
	if (worlds.contains(worldName)) {
		worlds.remove(worldName);
	}
}

module.exports = { getWorld, unloadWorld };
