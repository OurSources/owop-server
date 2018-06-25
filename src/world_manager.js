"use strict";

const World = require("./world");

class WorldManager {
	constructor() {
		this.worlds = new Map();
		this.worldsToUpdate = new Set();
		this.updateLoop = setInterval(() => this.updateWorlds(), 1000 / 20);
	}

	updateWorlds() {
		this.worldsToUpdate.forEach((world) => {
			if (!world.sendUpdates()) { /* Returns false if there's nothing remaining to update */
				this.worldsToUpdate.delete(world);
			}
		});
	}

	requestWorldUpdate(world) {
		this.worldsToUpdate.add(world);
	}

	getWorld(worldName) {
		let world = this.worlds.get(worldName);
		if (world) {
			return world;
		}

		world = new World(worldName, () => this.requestWorldUpdate(world));
		this.worlds.set(worldName, world);
		return world;
	}

	unloadWorld(worldName) {
		let world = this.worlds.get(worldName);
		if (world) {
			world.destroy();
			this.worlds.delete(worldName);
		}
	}

	destroy() {
		clearInterval(this.updateLoop);
		this.worlds.forEach(world => {
			world.destroy();
		});
	}
}

module.exports = WorldManager;
