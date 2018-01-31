'use strict';
const ProtoDef = require(`protodef`).ProtoDef;
const protoData = require(`./protocol.json`);

const States = {
	LOGIN: 0,
	PLAY: 1
};
for (let i in States) {
	States[States[i]] = i;
}

// FIXME: This is so ugly
const Protocol = {};
Protocol[States.LOGIN] = {
	toClient: new ProtoDef(),
	toServer: new ProtoDef()
};
Protocol[States.LOGIN].toClient.addProtocol(protoData, ["login", "toClient"]);
Protocol[States.LOGIN].toServer.addProtocol(protoData, ["login", "toServer"]);
Protocol[States.PLAY] = {
	toClient: new ProtoDef(),
	toServer: new ProtoDef()
};
Protocol[States.PLAY].toClient.addProtocol(protoData, ["play", "toClient"]);
Protocol[States.PLAY].toServer.addProtocol(protoData, ["play", "toServer"]);

function serialize(packet, state) {
	return Protocol[state].toClient.createPacketBuffer("packet", packet);
}

function deserialize(buffer, state) {
	return Protocol[state].toServer.parsePacketBuffer("packet", buffer).data;
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
	deserialize: deserialize,
	States: States
};
