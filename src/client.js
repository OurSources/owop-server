"use strict";

const config = require("./config/config.json");
const ReCaptcha = require("recaptcha2");
const recaptcha = new ReCaptcha(config.captcha);

const { States, protocol } = require("./protocol");

const firebase = require("firebase-admin");

const { User, Guest } = require("./user");
const { Player, Position } = require("./player");

class Client {
	constructor(socket, worldManager) {
		this.socket = socket;
		this.worldManager = worldManager;

		this.userId = null;

		this.world = null;
		this.localId = null;
		this.position = new Position(0, 0);
		this.user = null;

		this.state = States.LOGIN;

		//this.player = new Player();

		this.socket.on("message", (message) => {
			this.messageHandler(message);
		});
		this.socket.on("close", () => {
			this.close();
		});
	}

	messageHandler(message) {
		let packet = protocol.states[this.state].deserialize(message);
		console.log(packet);

		if (this.state == States.LOGIN) {
			switch(packet.name) {
				case "login":
					if (packet.params.guest) {
						recaptcha.validate(packet.params.token).then(() => {
							this.userId = "guest";
							this.sendPacket({
								name: "loginResponse",
								params: {
									statusCode: 0,
									statusMessage: ""
								}
							});
							this.state = States.PLAY;
							this.joinWorld(packet.params.worldName);
							this.sendPacket({
								name: "clientData",
								params: {
									userId: "",
									localId: this.id,
									pos: {
										x: 0,
										y: 0
									},
									username: "",
									xp: 0
								}
							});
						}).catch((errorCodes) => {
							// TODO
							console.log("Captcha failed", recaptcha.translateErrors(errorCodes));
						});
					} else {
						firebase.auth().verifyIdToken(packet.params.token).then((decodedToken) => {
							console.log(decodedToken);
							this.sendPacket({
								name: "loginResponse",
								params: {
									statusCode: 0,
									statusMessage: ""
								}
							});
						}).catch((error) => {
							// TODO
						});
					}
					break;
			}
		} else {
			switch(packet.name) {
				case "login":

					break;
			}
		}
	}

	joinWorld(worldName) {
		let world = this.worldManager.getWorld(worldName);
		this.world = world;

		this.id = world.clientJoin(this);
	}

	close() {
		if (this.world) {
			this.world.clientLeave(this);
		}
	}

	sendPacket(packet) {
		this.socket.send(protocol.states[this.state].serialize(packet));
	}
}

module.exports = Client;
