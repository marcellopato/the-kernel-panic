export class Player {
	constructor(data = {}) {
		this.x = data.x || 0;
		this.y = data.y || 0;
		this.inventory = data.inventory || [];
		this.health = data.health || 100;
		this.ram = data.ram !== undefined ? data.ram : 100;
		this.maxRam = 100;
		this.panicLevel = data.panicLevel || 0;
	}

	move(dx, dy) {
		if (this.ram <= 0) return false;
		this.x += dx;
		this.y += dy;
		this.ram -= 5; // Movement cost
		return true;
	}

	addItem(item) {
		this.inventory.push(item);
	}

	hasItem(itemName) {
		return this.inventory.some(i => i.toLowerCase().includes(itemName.toLowerCase()));
	}

	removeItem(itemName) {
		const index = this.inventory.findIndex(i => i.toLowerCase().includes(itemName.toLowerCase()));
		if (index > -1) {
			return this.inventory.splice(index, 1)[0];
		}
		return null;
	}

	serialize() {
		return {
			x: this.x,
			y: this.y,
			inventory: this.inventory,
			health: this.health,
			ram: this.ram,
			panicLevel: this.panicLevel
		};
	}
}
