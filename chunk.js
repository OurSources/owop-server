'use strict';
const compression = require(`./utils/compression`);

class Chunk {
	constructor(data, cache) {
		this._data = data;
		this._changed = false;
		this._cache = cache;
	}

	putPixel(x, y, color) {
		this._data.writeUInt16(color, ((y << 8) + x) << 1);
		this._changed = true;
	}

	getPixel(x, y) {
		return this._data.readUInt16(color, ((y << 8) + x) << 1);
	}

	get data() {
		return this._data;
	}

	get cache() {
		if (this._changed) {
			this._changed = false;
			this._cache = compression.compress(this.data);
		}

		return this._cache;
	}
}

module.exports = Chunk;
