import { rng } from '../utils/SeededRandom.js';

export const worldData = {
	adjectives: ['Corrompido', 'Congelado', 'Escuro', 'Vibrante', 'Silencioso', 'Inundado', 'Radioativo', 'Antigo'],
	nouns: ['Mainframe', 'Data Sector', 'Cable Corridor', 'Laboratory', 'Backup Room', 'Cooling Tunnel'],
	details: ['smells of burned ozone.', 'has cables pulsing like veins.', 'is covered in gray dust.', 'has screens flashing red eyes.', 'you hear a distant digital cry.'],
	items: ['Cryptography Key', 'RAM Chunk', 'Overclock Cartridge', 'Debug Module', 'Old Battery'],
	directions: ['norte', 'sul', 'leste', 'oeste']
};

export class World {
	constructor(visited = {}) {
		this.visited = visited;
	}

	rng(array) {
		return array[Math.floor(rng.next() * array.length)];
	}

	chance(percentage) {
		return rng.next() * 100 < percentage;
	}

	generateRoom(x, y) {
		const key = `${x},${y}`;
		if (this.visited[key]) return this.visited[key];

		// Special start room
		if (x === 0 && y === 0) {
			const room = {
				desc: "Insertion Point. A message flashes on the screen: 'OBJECTIVE: FIND THE SECURITY NODE TO ESCAPE'.",
				item: "RAM Chunk",
				isFirewall: false,
				firewallType: null
			};
			this.visited[key] = room;
			return room;
		}

		const dist = Math.abs(x) + Math.abs(y);

		// Rebalanced Chances
		let firewallChance = 0;
		if (dist >= 1) firewallChance = 25; // 25% chance at distance 1
		if (dist >= 3) firewallChance = 45; // 45% chance at distance 3+

		const isFirewall = this.chance(firewallChance);

		let desc = "";
		let firewallType = null;

		if (isFirewall) {
			firewallType = this.rng(['logic', 'brute', 'environment']);
			const types = {
				'logic': "FIREWALL DE LOGICA MESTRE",
				'brute': "GUARDIAO DE FORCA BRUTA",
				'environment': "DADOS CORROMPIDOS"
			};
			desc = `ALERT! You found a ${types[firewallType]}. Total blockage detected.`;
		} else {
			desc = `Um ${this.rng(worldData.nouns)} ${this.rng(worldData.adjectives)}. O local ${this.rng(worldData.details)}`;
		}

		let itemChance = isFirewall ? 0 : 60; // 60% chance of items in safe rooms

		const room = {
			desc: desc,
			item: this.chance(itemChance) ? this.rng(worldData.items) : null,
			isFirewall: isFirewall,
			firewallType: firewallType
		};

		this.visited[key] = room;
		return room;
	}

	serialize() {
		return this.visited;
	}
}
