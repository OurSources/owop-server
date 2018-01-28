'use strict';

class HashMap {
	constructor() {
		this._size = 0;
		this._data = {};
	}

	get size() {
		return this._size;
	}

	add(key, value) {
		this._data[key] = value;
		this._size++;
	}

	get(key) {
		return this.contains(key) ? this._data[key] : undefined;
	}

	remove(key) {
		delete this._data[key];
		this._size--;
	}

	contains(key) {
		//console.log(`contains ${key} ${this[key]}`);
		return this._data.hasOwnProperty(key);
	}

	forEach(callback) {
		Object.keys(this._data).forEach((key) => callback(key, this.get(key)));
	}
}

module.exports = HashMap;
