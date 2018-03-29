'use strict';
const WebSocket = require(`ws`);
const HashMap = require(`./utils/hashmap`);
const World = require(`./world`);
const WorldManager = require(`./world_manager`);
const IdManager = require(`./id_manager`);
const Player = require(`./player`);
const auth = require(`./auth`);
const Proto = require(`./protocol`).Protocol;

var server = new WebSocket.Server({ port: 9000 }, () => console.log(`Server started!`));

var idMgr = new IdManager(); /* Per world or global? */
var worldMgr = new WorldManager();
var proto = new Proto(worldMgr, null);

let clients = new Set();

function broadcast(message) {
	clients.forEach(c => c.send(message));
}

class Client {
	constructor(socket, id) {
		this.id = id;
		this.socket = socket;

		this.protoState = null;

		console.log("connection start: " + this.id);
	}

	close() {
		this.socket.close();
	}
}

server.on(`connection`, (socket, data) => {
	socket.onerror = () => {};
	
	let client = new Client(socket, idMgr.newId());
	
	clients.add(client);
	proto.onConnection(client);
	socket.onclose = () => {
		clients.delete(client);
		proto.onDisconnection(client);
		idMgr.freeId(client.id);
	};
});

server.on(`error`, () => {
	
});

//module.exports = { getWorld, unloadWorld };
