"use strict";

const fs = require("fs");
const path = require("path");
const Chunk = require("./chunk");

const worldDir = "worlds";

class WorldLoader {
	constructor(worldName) {
		this.worldPath = path.resolve(worldDir, worldName);
		try {
			fs.mkdirSync(this.worldPath);
		} catch (e) {
			if (e.code !== 'EEXIST') {
				throw e;
			}
		}
	}

	async saveChunk(x, y, chunk) {
		const chunkName = path.resolve(this.worldPath, `c.${x}.${y}.rgb`);

		await fs.writeFile(chunkName, chunk.data);
	}

	async loadChunk(x, y) {
		const chunkName = path.resolve(this.worldPath, `c.${x}.${y}.rgb`);

		var data;
		try {
			data = await fs.readFile(chunkName);
		} catch (e) {
			if (e.code !== 'ENOENT') {
				throw e;
			}
			data = Buffer.alloc(256 * 256 * 3, 0xFF);
		}

		return new Chunk(data);
	}
}

module.exports = WorldLoader;
