import recaptcha from "recaptcha2";
import config from "./config";
const captcha = new recaptcha(config.captcha);

import { States } from "./protocol";

import { protocol } from "./server";

export class Client {
	constructor(socket) {
		this.socket = socket;
		
		this.state = States.LOGIN;
		
		this.socket.on("message", function(message) {
			this.messageHandler(message);
		}.bind(this));
	}
	
	messageHandler(message) {
		console.log(message);
		let packet = protocol.states[this.state].deserialize(message);
		console.log(packet);
		
		if (this.state == States.LOGIN) {
			switch(packet.name) {
				case "login":
					if (packet.params.guest) {
						captcha.validate(packet.params.token).then(function() {
							this.sendPacket({
								name: "loginResponse",
								params: {
									statusCode: 0,
									statusMessage: "hello world"
								}
							});
							this.state = States.PLAY;
							this.sendPacket({
								name: "worldData",
								params: {
									worldName: "main",
									cursors: [
										{
											userId: "bob123",
											localId: 123,
											pos: {x: 5, y: -5}
										}
									]
								}
							});
						}.bind(this)).catch(function() {
							
						}.bind(this));
					} else {
						// TODO
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
	
	sendPacket(packet) {
		this.socket.send(protocol.states[this.state].serialize(packet));
	}
}
