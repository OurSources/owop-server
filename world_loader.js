const fs = require(`fs`);
const path = require(`path`);
const Chunk = require(`./chunk`);

const worldDir = `chunkdata`;

function saveChunk(world, chunk) {
    // TODO
}

function loadChunk(world, x, y, callback) {
    var chunkName = `${worldDir}${path.sep}${world.name}${path.sep}r.${x}.${y}.pxr`;
    fs.readFile(chunkName, (err, data) => {
        if (err) {
            var data = new Buffer.alloc(16 * 16 * 3, 0xFFFFFF);
            callback(new Chunk(data));
        } else {
            callback(new Chunk(data));
        }
    });
}

module.exports = { saveChunk, loadChunk };