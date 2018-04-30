'use strict';

const World = require(`./world`);

class WorldManager {
	constructor() {
		this.worlds = new Map();
		this.worldsToUpdate = new Set();
		this.updateLoop = setInterval(() => this.updateWorlds(), 50);
	}
	
	destroy() {
		clearInterval(this.updateLoop);
	}
	
	requestWorldUpdate(world) {
		this.worldsToUpdate.add(world);
	}
	
	updateWorlds() {
		this.worldsToUpdate.forEach((world) => {
			if (!world.sendUpdates()) { /* Returns false if there's nothing remaining to update */
				this.worldsToUpdate.delete(world);
			}
		});
	}
	
	getWorld(worldName) {
		return this.worlds.get(worldName);
	}
	
	getOrCreateWorld(worldName) {
		var world = getWorld(worldName);
		if (world) {
			return world;
		}

		var world = new World(worldName, () => this.requestWorldUpdate(world));
		this.worlds.set(worldName, world);
		return world;
	}
	
	unloadWorld(worldName) {
		var world = this.worlds.get(worldName);
		if (world) {
			world.destroy();
			this.worlds.delete(worldName);
		}
	}
}

module.exports = WorldManager;