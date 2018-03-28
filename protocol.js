'use strict';
const ProtoDef = require(`protodef`).ProtoDef;
const protoData = require(`./owop-protocol/protocol.json`);

const States = {
	LOGIN: 0,
	PLAY: 1
};
for (let i in States) {
	States[States[i]] = i;
}

class NetworkState {
	constructor(id) {
		this.id = id;
		
		this.toClient = new ProtoDef();
		this.toServer = new ProtoDef();
		
		this.prevState = null;
		this.nextState = null;
	}

	linkStates(prev, next) {
		this.prevState = prev;
		this.nextState = next;
	}

	upgrade(client, data, downgrade = false) {
		this.onLeave(client, false);
		if (downgrade) { // WARN: no null check
			this.prevState.transferConnection(client, data);
		} else {
			this.nextState.transferConnection(client, data);
		}
	}
	
	transferConnection(client, data) {
		client.protoState = this;
		client.socket.onmessage = msg => this.onMessage(client, msg);
		this.onTransfer(client, data);
	}
	
	deserialize(msg) {
		return this.toServer.parsePacketBuffer("packet", msg).data;
	}
	
	serialize(packet) {
		return this.toClient.createPacketBuffer("packet", packet);
	}
	
	onMessage(client, msg) {
		/* If not binary or length is 0 */
		if (!msg.data.byteLength) {
			client.close();
			return;
		}
		
		var packet;
		try {
			packet = this.deserialize(msg);
		} catch(e) {
			console.log("invalid packet!", e);
			return;
		}
		
		this.onPacket(client, packet);
	}
	
	onTransfer(client, data) { } // Called when the socket switches to this state
	
	onPacket(client, packet) { } // packet is the packet parsed by protodef
	
	onLeave(client, wasDisconnected) { } // Called when the socket upgrades to another state, or disconnects
}

class LoginState extends NetworkState {
	constructor(loginManager) {
		super(States.LOGIN);
		
		this.toClient.addProtocol(protoData, ["login", "toClient"]);
		this.toServer.addProtocol(protoData, ["login", "toServer"]);
		
		this.loginMgr = loginManager;
	}
	
	onTransfer(client, data) {
		console.log('Client transfered', client.id, this.constructor.name);
	}
	
	onPacket(client, packet) {
		console.log(packet);
		switch(packet.name) {
			case "loginStart":
				console.log("BOB ;( " + packet.params.bob);
				break;
		}
	}
	
	onLeave(client, wasDisconnected) {
		console.log('Client closed', client.id, wasDisconnected);
	}
}

class PlayState extends NetworkState {
	constructor(worldManager) {
		super(States.PLAY);
		
		this.toClient.addProtocol(protoData, ["play", "toClient"]);
		this.toServer.addProtocol(protoData, ["play", "toServer"]);
		
		this.worldMgr = worldManager;
	}
	
	onTransfer(client, data) {
		console.log('Client transfered', client.id, this.constructor.name);
	}
	
	onPacket(client, packet) {
		console.log(packet);
		switch(packet.name) {
			
		}
	}
	
	onLeave(client, wasDisconnected) {
		console.log('Client closed', client.id, wasDisconnected);
	}
}

function stateChain(initialState) {
	var states = {};
	const nextState = (currentState, prevState) => {
		states[currentState.id] = currentState;
		return {
			next: state => {
				currentState.linkStates(prevState, state);
				return nextState(state, currentState);
			},
			end: () => {
				currentState.linkStates(prevState, null);
				return {
					initial: initialState,
					byId: states
				};
			}
		};
	};
	return nextState(initialState, null);
}

class Protocol {
	constructor(worldManager, loginManager) {
		this.states = stateChain(new LoginState(loginManager))
		                   .next(new PlayState(worldManager)).end();
	}
	
	onConnection(client) {
		this.states.initial.transferConnection(client);
	}
	
	onDisconnection(client) {
		client.protoState.onLeave(client, true);
	}
};

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
	Protocol: Protocol,
	States: States
};
