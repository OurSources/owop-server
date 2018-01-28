'use strict';

class Player {
	constructor(socket) {
		this._socket = socket;
	}

	send(message) {
		this._socket.send(message);
	}

	kick() {
		this._socket.close();
	}

	update(x, y, tool, color) {
		this._x = x;
		this._y = y;
		this._tool = tool;
		this._color = color;
	}

	get id() {
		return this._id;
	}

	get world() {
		return this._world;
	}

	get x() {
		return this._x;
	}

	get y() {
		return this._y;
	}

	get tool() {
		return this._tool;
	}

	get color() {
		return this._color;
	}

	toString() {
		return `[Player world:'${this._world.name}' id:${this._id}]`;
	}
}

module.exports = Player;
