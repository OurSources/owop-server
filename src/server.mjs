'use strict';
import WebSocket from "ws";
import IdManager from "./id_manager";
import "./auth";
import WorldManager from "./world_manager";
import { Protocol } from "./protocol";

import Client from "./client";

let server = new WebSocket.Server({ port: 9000 }, () => console.log("Server started!"));

export const protocol = new Protocol();
export const worldManager = new WorldManager();

let idMgr = new IdManager(); /* Per world or global? */

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
	socket.on("error", function() {});
});

server.on("error", () => {
	
});
