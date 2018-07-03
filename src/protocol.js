"use strict";

const ProtoDef = require("protodef");
const protoData = require("../owop-protocol/protocol.json");

const States = {
	LOGIN: 0,
	PLAY: 1
};
for (let i in States) {
	States[States[i]] = i;
}

class NetworkState {
	constructor() {
		this.toClient = new ProtoDef.ProtoDef();
		this.toServer = new ProtoDef.ProtoDef();
	}

	deserialize(msg) {
		return this.toServer.parsePacketBuffer("packet", msg).data;
	}

	serialize(packet) {
		return this.toClient.createPacketBuffer("packet", packet);
	}
}

class LoginState extends NetworkState {
	constructor() {
		super();

		this.toClient.addProtocol(protoData, ["login", "toClient"]);
		this.toServer.addProtocol(protoData, ["login", "toServer"]);
	}
}

class PlayState extends NetworkState {
	constructor() {
		super();

		this.toClient.addProtocol(protoData, ["play", "toClient"]);
		this.toServer.addProtocol(protoData, ["play", "toServer"]);
	}
}

const protocol = {
	states: {
		[States.LOGIN]: new LoginState(),
		[States.PLAY]: new PlayState()
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

module.exports = {
	States: States,
	protocol: protocol
};
