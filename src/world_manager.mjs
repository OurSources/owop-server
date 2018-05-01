'use strict';

import World from "./world";

export default class WorldManager {
	constructor() {
		this.worlds = new Map();
		this.worldsToUpdate = new Set();
		this.updateLoop = setInterval(() => this.updateWorlds(), 50);
	}
	
	destroy() {
		clearInterval(this.updateLoop);
		this.worlds.forEach(world => {
			world.destroy();
		});
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
}
