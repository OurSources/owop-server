'use strict';
const fs = require(`fs`);
const path = require(`path`);
const compression = require(`./utils/compression`);
const Chunk = require(`./chunk`);

const worldDir = `chunkdata`;

function saveChunk(world, chunk) {
	// TODO
}

function loadChunk(world, x, y, callback) {
	var chunkName = `${worldDir}${path.sep}${world.name}${path.sep}r.${x}.${y}.pxr`;
	fs.readFile(chunkName, (err, data) => {
		if (err) {
			var data = new Buffer.alloc(256 * 256 * 2, 0xFF);
			callback(new Chunk(data, compression.compress(data)));
		} else {
			callback(new Chunk(compression.decompress(data), data));
		}
	});
}

module.exports = { saveChunk, loadChunk };
