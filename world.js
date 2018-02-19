'use strict';
const HashMap = require(`./utils/hashmap`);
const ArrayList = require(`./utils/arraylist`);
const world_loader = require(`./world_loader`);

class World {
	constructor(name, requestUpdate) {
		this._name = name;
		this._online = 0;
		this._players = new Map();
		this._playerUpdates = new Set();
		/* Should a map be used here? Would prevent sending multiple updates for a single pixel */
		this._pixelUpdates = new ArrayList();
		this._playerDisconnects = new Set();
		this._chunks = new Map();
		
		this.requestUpdate = requestUpdate;
	}
	
	destroy() {
		/* Save chunks here */
	}

	get online() {
		return this._players.size;
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

	getChunk(x, y, callback) {
		var chunkKey = this.getChunkKey(x, y);
		var chunk = this._chunks.get(chunkKey);
		if (!chunk) {
			world_loader.loadChunk(this, x, y, (chunk) => {
				this._chunks.set(chunkKey, chunk);
				callback(chunk);
			});
		} else {
			callback(chunk);
		}
	}

	putPixel(x, y, color) {
		this.getChunk(x >> 8, y >> 8, (chunk) => {
			if (chunk.getPixel(x, y) == color) return;
			chunk.putPixel(x, y, color);
			this._pixelUpdates.add({
				x: x,
				y: y,
				color: color
			});
		});
	}

	playerUpdated(player) {
		this._playerUpdates.add(player);
	}

	playerJoined(player) {
		player.send(`Joined world ${this._name}. Your ID: ${player.id}`);
		this._players.set(player.id, player);
	}

	playerLeft(player) {
		this._playerDisconnects.add(player.id);
		this._players.delete(player.id);
	}

	broadcast(message) {
		this._players.forEach((key, player) => player.send(message));
	}

	sendUpdates() {
		var players = this._playerUpdates.size;
		var pixels = this._pixelUpdates.size;
		var disconnects = this._playerDisconnects.size;

		if (players + pixels + disconnects < 1) {
			return false;
		}

		var message = Buffer.allocUnsafe(5 + players * 16 + pixels * 11 + disconnects * 4);
		message.writeUInt8(0x01, 0);
		message.writeUInt8(players, 1);
		var offset = 2;
		var i = 0;
		this._playerUpdates.forEach(player => {
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
		this._pixelUpdates.forEach(pixel => {
			message.writeInt32LE(pixel.x, offset + 11 * i);
			message.writeInt32LE(pixel.y, offset + 11 * i + 4);
			message.writeUInt16LE(pixel.color, offset + 11 * i + 8);
			i++;
		});

		message.writeUInt8(disconnects, offset + 11 * i);
		offset += 1 + 11 * i;
		i = 0;
		this._playerDisconnects.forEach(playerID => {
			message.writeUInt32LE(playerID, offset + i * 4);
			i++;
		});

		this._playerUpdates.clear();
		this._playerDisconnects.clear();
		this._pixelUpdates.clear();

		this._players.forEach((key, player) => player.send(message));
	}

	get name() {
		return this._name;
	}

	get online() {
		return this._players.size;
	}
}

module.exports = World;
