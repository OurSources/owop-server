// public key bq3YcffrmB8w2ghOvCexgH4aYVhmz7TB

const WebSocket = require(`ws`);
const HashMap = require(`./utils/hashmap`);
const World = require(`./world`);
const Player = require(`./player`);

var server = new WebSocket.Server({ port: 25565 }, start);
var worlds = new HashMap();
var players = new HashMap();
var totalOnline = 0;

function start() {
    console.log(`Started`);
    server.on(`connection`, (ws, data) => {
        ws.on(`message`, (message) => {
            process(ws, message);
        });
        console.log(`Connected socket from ${ws._socket.remoteAddress}`);
        ws.send(new Uint8Array([5, 3]).buffer); // no captcha
    });
    setInterval(() => {
        worlds.forEach((key, world) => world.sendUpdates());
    }, 20);
}

function process(ws, message) {
    //var socketAddress = `${ws._socket.remoteAddress}:${ws._socket.remotePort}`;
    var socketAddress = ws._socket.remoteAddress;
    if (!players.contains(socketAddress)) {
        if (message.readUInt16LE(message.byteLength - 2) != 1337) {
            ws.close();
            return;
        }

        var worldName = message.slice(0, message.byteLength - 2).toString('utf8');
        if (!isWorldNameValid(worldName)) {
            ws.close();
            return;
        }

        var world = getWorld(worldName);
        var player = new Player(world.getNextID(), world, ws);
        world.playerJoined(player);
        players.add(socketAddress, player);
        console.log(`Joined ${player} from ${socketAddress} to ${worldName}`);

        var message = Buffer.allocUnsafe(5);
        message.writeUInt8(0x00, 0);
        message.writeUInt32LE(player.id, 1);
        player.send(message);

        var message = Buffer.allocUnsafe(2);
        message.writeUInt8(0x04, 0);
        message.writeUInt8(1, 1);
        player.send(message);

        totalOnline++;
    } else {
        var player = players.get(socketAddress);
        if (typeof (message) == 'string') {
            processString(player, message.slice(0, message.length - 1));
            return;
        } else {
            message = Buffer.from(message);
        }
        switch (message.byteLength) {
            case 8: {
                var x = message.readInt32LE(0);
                var y = message.readInt32LE(4);
                player.world.getChunk(x, y, (chunk) => {
                    var response = Buffer.allocUnsafe(9);
                    response.writeUInt8(0x02, 0);
                    response.writeInt32LE(x, 1);
                    response.writeInt32LE(y, 5);
                    player.send(Buffer.concat([response, chunk.data]));
                });
                break;
            }
            case 10: {
                //if (!player.isAdmin()) {
                //    player.kick();
                //} else {
                var x = message.readInt32LE(0);
                var y = message.readInt32LE(4);
                var color = message.readUInt16LE(8);
                //player.world.clearChunk(x, y, color);
                //}
                break;
            }
            case 11: {
                var x = message.readInt32LE(0);
                var y = message.readInt32LE(4);
                var color = {
                    r: message.readUInt8(8),
                    g: message.readUInt8(9),
                    b: message.readUInt8(10)
                };
                player.world.putPixel(x, y, color);
                break;
            }
            case 12: {
                var x = message.readInt32LE(0);
                var y = message.readInt32LE(4);
                var color = {
                    r: message.readUInt8(8),
                    g: message.readUInt8(9),
                    b: message.readUInt8(10)
                };
                var tool = message.readUInt8(11);
                player.update(x, y, tool, color);
                player._world.playerUpdated(player);
                break;
            }
            default:
                console.warn(`Unknown packet from ${player} with ${message.byteLength} bytes!`);
                //player.kick();
                break;
        }
    }
}

function processString(player, message) {
    console.log(`${player}: ${message}`);
    player.world.broadcast(`${player.id}: ${message}`);
}

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

function isWorldNameValid(worldName) {
    /* Validate world name, allowed chars are a..z, 0..9, '_' and '.' 
    final int size = nameBytes.capacity();

    if (size < 3 || size - 2 > 24 || nameBytes.getShort(size - 2) != 1337) {
        return false;
    }

    nameBytes.limit(size - 2);
    for (int i = 0; i < nameBytes.limit(); i++) {
        final byte b = nameBytes.get(i);
        if (!((b > 96 && b < 123) || (b > 47 && b < 58) || b == 95 || b == 46)) {
            return false;
        }
    }*/
    // TODO: implement this
    return true;
}



module.exports = [worlds, players];