'use strict';
const Packet = require(`./packet`);
const PACKETS = require(`./packets`);
const server = require(`../server`);
const CONFIG = require(`../config`);

console.log(`Loaded ${Object.keys(PACKETS).length} packets`);

function onPacket(rawPacket, player, socketAddress) {
	var packet = new Packet(rawPacket);
	if (packet.id >= 200) {
		console.warn(`Player ${socketAddress} sent server packet ${packet.id}`);
		player.kick();
	}
	switch (packet.id) {
		case PACKETS.ClientHello:
			var clientVersion = packet.readUInt8();
			if (clientVersion != CONFIG.serverVersion) {
				player.kick();
			} else {
				player.send(new Packet(undefined, PACKETS.ServerHello));
			}
			break;
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

module.exports = onPacket;
