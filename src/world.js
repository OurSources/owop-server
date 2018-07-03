"use strict";

const HashMap = require("./utils/hashmap");
const ArrayList = require("./utils/arraylist");
const WorldLoader = require("./world_loader");

const IdManager = require("./id_manager");

const { States, protocol } = require("./protocol");

class World {
	constructor(worldName, requestUpdate) {
		console.log("new world");
		this.name = worldName;
		this.clients = new Map();
		this.playerUpdates = new Set();

		this.idManager = new IdManager();
		this.worldLoader = new WorldLoader(worldName);

		/* Should a map be used here? Would prevent sending multiple updates for a single pixel */
		this.pixelUpdates = new ArrayList();
		this.chunks = new Map();

		this.requestUpdate = requestUpdate;
	}

	destroy() {
		/* Save chunks here */
	}

	get online() {
		return this.clients.size;
	}

	/*getNextID() {
		this._playerID++;
		return this._playerID - 1;
	}*/

	getChunkKey(x, y) {
		/* If the chunk position is signed 24-bit (or less), it actually fits in a js number */
		/* >>> 0 'casts' to unsigned, * 0x1000000 shifts the num 24 bits */
		return ((x >>> 0 & 0xFFFFFF) * 0x1000000 + (y >>> 0 & 0xFFFFFF));
	}

	async getChunk(x, y) {
		var chunkKey = this.getChunkKey(x, y);
		var chunk = this.chunks.get(chunkKey);
		if (!chunk) {
			chunk = await this.worldLoader.loadChunk(x, y);
			this.chunks.set(chunkKey, chunk);
		}
		return chunk;
	}

	async putPixel(x, y, color) {
		const chunk = await this.getChunk(x >> 8, y >> 8);
		if (!chunk || chunk.getPixel(x, y) == color) {
			return;
		}
		chunk.putPixel(x, y, color);
		this.pixelUpdates.add({
			x: x,
			y: y,
			color: color
		});
	}

	playerUpdated(player) {
		this.playerUpdates.add(player);
	}

	clientJoin(client) {
		client.sendPacket({
			name: "worldData",
			params: {
				worldName: this.name,
				cursors: Array.from(this.clients, function(entry) {
					let key = entry[0];
					let client = entry[1];
					return {
						userId: client.userId,
						localId: key,
						pos: client.position
					};
				})
			}
		});
		//player.send(`Joined world ${this.name}. Your ID: ${client.id}`);
		let id = this.idManager.newId();
		client.localId = id;
		this.clients.set(id, client);

		return id;
	}

	clientLeave(client) {
		this.clients.delete(client.localId);
		this.broadcast(protocol.states[States.PLAY].serialize({
			name: "playerLeave",
			params: {
				localId: client.localId
			}
		}));
	}

	broadcast(message) {
		this.clients.forEach((key, client) => client.socket.send(message));
	}

	sendUpdates() {
		var players = this.playerUpdates.size;
		var pixels = this.pixelUpdates.size;
		var disconnects = this.playerDisconnects.size;

		if (players + pixels + disconnects < 1) {
			return false;
		}

		var message = Buffer.allocUnsafe(5 + players * 16 + pixels * 11 + disconnects * 4);
		message.writeUInt8(0x01, 0);
		message.writeUInt8(players, 1);
		var offset = 2;
		var i = 0;
		this.playerUpdates.forEach(player => {
			message.writeUInt32LE(player.id, offset + 16 * i);
			message.writeInt32LE(player.x, offset + 16 * i + 4);
			message.writeInt32LE(player.y, offset + 16 * i + 8);
			message.writeUInt16LE(player.color, offset + 16 * i + 12);
			message.writeUInt8(player.tool, offset + 16 * i + 14);
			i++;
		});

		message.writeUInt16LE(pixels, 2 + 16 * i);
		offset += 16 * i + 2;
		i = 0;
		this.pixelUpdates.forEach(pixel => {
			message.writeInt32LE(pixel.x, offset + 11 * i);
			message.writeInt32LE(pixel.y, offset + 11 * i + 4);
			message.writeUInt16LE(pixel.color, offset + 11 * i + 8);
			i++;
		});

		message.writeUInt8(disconnects, offset + 11 * i);
		offset += 1 + 11 * i;
		i = 0;
		this.playerDisconnects.forEach(playerID => {
			message.writeUInt32LE(playerID, offset + i * 4);
			i++;
		});

		this.playerUpdates.clear();
		this.playerDisconnects.clear();
		this.pixelUpdates.clear();

		this.clients.forEach((key, player) => player.send(message));
	}
}

module.exports = World;
