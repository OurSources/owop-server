'use strict';

export class Position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class Player {
	constructor() {
		this.pos = new Position(0, 0);
	}

	update(x, y, tool, color) {
		this.pos.x = x;
		this.pos.y = y;
		this._tool = tool;
		this._color = color;
	}

	get id() {
		return this._id;
	}

	get world() {
		return this._world;
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
