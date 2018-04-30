'use strict';
import WebSocket from "ws";
import HashMap from "./utils/hashmap";
import World from "./world";
import WorldManager from "./world_manager";
import IdManager from "./id_manager";
import Player from "./player";
import auth from "./auth";
import { Protocol } from "./protocol";

import { Client } from "./client";

let server = new WebSocket.Server({ port: 9000 }, () => console.log("Server started!"));

export const protocol = new Protocol();

let idMgr = new IdManager(); /* Per world or global? */
let worldMgr = new WorldManager();

let clients = new Set();

function broadcast(message) {
	clients.forEach(c => c.send(message));
}

server.on("connection", (socket, data) => {
	let client = new Client(socket);
	
	clients.add(client);
	socket.onclose = () => {
		clients.delete(client);
	};
});

server.on("error", () => {
	
});
