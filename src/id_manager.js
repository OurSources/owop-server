"use strict";

class IdManager {
	constructor() {
		this.currentId = 0;
		this.freeIds = [];
		this.freeIds.sortedPush = function(item) {
			let index = 0;
			if (item >= this[this.length - 1]) {
				return this.push(item) - 1;
			}
			while (this[index] < item) index++;
			this.splice(index, 0, item);
			return index;
		};
	}

	newId() {
		if (this.freeIds.length !== 0) {
			return this.freeIds.shift();
		}
		return ++this.currentId;
	}

	freeId(id) { /* Only free ids returned by newId(), once. */
		if (id === this.currentId) {
			--this.currentId;
		} else {
			this.freeIds.sortedPush(id);
		}
		this.shrink();
	}

	shrink() {
		let len = this.freeIds.length - 1;
		let didSomething = false;
		for (; len >= 0; len--) {
			if (this.freeIds[len] === this.currentId) {
				--this.currentId;
				didSomething = true;
			} else {
				break;
			}
		}
		if (didSomething) {
			this.freeIds.length = len + 1;
		}
	}
}

module.exports = IdManager;
