'use strict';
const ProtoDef = require(`protodef`).ProtoDef;
const protoData = require(`./protocol.json`);

const States = {
	0: "LOGIN",
	1: "PLAY"
};

const Protocol = {
	LOGIN: {
		toClient: (new ProtoDef()).addProtocol(protoData, ["login", "toClient"]),
		toServer: (new ProtoDef()).addProtocol(protoData, ["login", "toServer"])
	},
	PLAY: {
		toClient: (new ProtoDef()).addProtocol(protoData, ["play", "toClient"]),
		toServer: (new ProtoDef()).addProtocol(protoData, ["play", "toServer"])
	}
};

function serialize(player, packet) {
	return Protocol[States[player.state]].toClient.createPacketBuffer("packet", packet);
}

function deserialize(player, buffer) {
	return Protocol[States[player.state]].toServer.parsePacketBuffer("packet", buffer);
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

module.exports = {
	serialize: serialize,
	deserialize: deserialize
};
