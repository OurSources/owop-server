import recaptcha from "recaptcha2";
import config from "./config";
const captcha = new recaptcha(config.captcha);

import { States } from "./protocol";

import { protocol, worldManager } from "./server";

import firebase from "firebase-admin";

import { User, Guest } from "./user";
import { Player, Position } from "./player";

export default class Client {
	constructor(socket) {
		this.socket = socket;
		
		this.world = "main";
		this.position = new Position(0, 0);
		this.user = null;
		
		this.state = States.LOGIN;
		
		//this.player = new Player();
		
		this.socket.on("message", function(message) {
			this.messageHandler(message);
		}.bind(this));
	}
	
	messageHandler(message) {
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
									statusMessage: ""
								}
							});
							this.state = States.PLAY;
							this.joinWorld(packet.params.worldName);
						}.bind(this)).catch(function() {
							// TODO
						}.bind(this));
					} else {
						firebase.auth().verifyIdToken(packet.params.token).then(function(decodedToken) {
							console.log(decodedToken);
							this.sendPacket({
								name: "loginResponse",
								params: {
									statusCode: 0,
									statusMessage: ""
								}
							});
						}.bind(this)).catch(function(error) {
							// TODO
						}.bind(this));
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
		this.world = worldName;
		let world = worldManager.getWorld(worldName);
		
		world.clientJoin(this);
	}
	
	sendPacket(packet) {
		this.socket.send(protocol.states[this.state].serialize(packet));
	}
}
