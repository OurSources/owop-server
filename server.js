'use strict';
const WebSocket = require(`ws`);
const HashMap = require(`./utils/hashmap`);
const World = require(`./world`);
const Player = require(`./player`);
const auth = require(`./auth`);
const protocol = require(`./protocol`);

var server = new WebSocket.Server({ port: 25565 }, () => console.log(`Server started!`));
var worlds = new HashMap();
var players = new HashMap();
var totalOnline = 0;

server.on(`connection`, (ws, data) => {
	ws.on(`message`, (rawPacket) => {
		var socketAddress = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
		if (typeof (rawPacket) == `string`) {
			ws.kick(); // we don't use string packets
		}
		protocol.onPacket(rawPacket, players.get(socketAddress), socketAddress);
	});
	console.log(`Connected ${ws._socket.remoteAddress}:${ws._socket.remotePort}`);
	// ws.send(new Uint8Array([5, 3]).buffer); // no captcha
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
