export const worldData = {
	adjectives: ['Corrompido', 'Congelado', 'Escuro', 'Vibrante', 'Silencioso', 'Inundado', 'Radioativo', 'Antigo'],
	nouns: ['Mainframe', 'Setor de Dados', 'Corredor de Cabos', 'Laboratório', 'Sala de Backups', 'Túnel de Resfriamento'],
	details: ['cheira a ozônio queimado.', 'tem cabos pulsando como veias.', 'está coberto de poeira cinza.', 'tem telas piscando olhos vermelhos.', 'ouve-se um choro digital distante.'],
	items: ['Chave de Criptografia', 'Pedaço de RAM', 'Cartucho de Overclock', 'Módulo de Debug', 'Bateria Velha'],
	directions: ['norte', 'sul', 'leste', 'oeste']
};

export class World {
	constructor(visited = {}) {
		this.visited = visited;
	}

	rng(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	chance(percentage) {
		return Math.random() * 100 < percentage;
	}

	generateRoom(x, y) {
		const key = `${x},${y}`;
		if (this.visited[key]) return this.visited[key];

		// Special start room
		if (x === 0 && y === 0) {
			const room = {
				desc: "Ponto de Inserção. Uma mensagem pisca na tela: 'OBJETIVO: ENCONTRE O NO DE SEGURANCA PARA ESCAPAR'.",
				item: "Pedaço de RAM",
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
			desc = `ALERTA! Você encontrou um ${types[firewallType]}. Bloqueio total detectado.`;
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
