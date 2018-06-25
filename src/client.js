"use strict";

const ReCaptcha = require("recaptcha2");
const config = require("./config/config.json");
const captcha = new ReCaptcha(config.captcha);

const { States } = require("./protocol");

const firebase = require("firebase-admin");

const { User, Guest } = require("./user");
const { Player, Position } = require("./player");

class Client {
	constructor(socket, protocol, worldManager) {
		this.socket = socket;
		this.protocol = protocol;
		this.worldManager = worldManager;

		this.world = "main";
		this.position = new Position(0, 0);
		this.user = null;

		this.state = States.LOGIN;

		//this.player = new Player();

		this.socket.on("message", (message) => {
			this.messageHandler(message);
		});
	}

	messageHandler(message) {
		let packet = this.protocol.states[this.state].deserialize(message);
		console.log(packet);

		if (this.state == States.LOGIN) {
			switch(packet.name) {
				case "login":
					if (packet.params.guest) {
						captcha.validate(packet.params.token).then(() => {
							this.sendPacket({
								name: "loginResponse",
								params: {
									statusCode: 0,
									statusMessage: ""
								}
							});
							this.state = States.PLAY;
							this.joinWorld(packet.params.worldName);
						}).catch((errorCodes) => {
							// TODO
							console.log("Captcha failed", captcha.translateErrors(errorCodes));
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

		world.clientJoin(this);
	}

	sendPacket(packet) {
		this.socket.send(this.protocol.states[this.state].serialize(packet));
	}
}

module.exports = Client;
