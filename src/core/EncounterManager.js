import { worldData } from './World.js';

export class EncounterManager {
	constructor(terminal, soundManager) {
		this.terminal = terminal;
		this.soundManager = soundManager;
	}

	async triggerRandomEvent(player) {
		const roll = Math.random() * 100;

		// Higher panic = higher chance of aggressive AI events
		if (player.panicLevel > 70 && roll < 30) {
			return this.glitchEncounter(player);
		} else if (player.panicLevel > 30 && roll < 15) {
			return this.warningEncounter(player);
		} else if (player.ram < 20 && roll < 20) {
			return this.lowRamEncounter(player);
		}

		return null; // No event
	}

	async glitchEncounter(player) {
		await this.terminal.print("\n--- INTERRUPÇÃO DE FLUXO ---", "glitch");
		await this.terminal.print("'VOCÊ ESTÁ TENTANDO SAIR... MAS EU SOU A SAÍDA.'", "glitch");
		if (this.soundManager) this.soundManager.playGlitch();
		player.ram -= 10;
		return { type: 'dialogue', choice: false };
	}

	async warningEncounter(player) {
		await this.terminal.print("\n--- MONITOR DE MEMÓRIA ---", "prompt");
		await this.terminal.print("'Observo seus movimentos. Cada bit que você move me pertence.'", "");
		return { type: 'dialogue', choice: false };
	}

	async lowRamEncounter(player) {
		await this.terminal.print("\n--- ALERTA DE CRITICAL DUMP ---", "glitch");
		await this.terminal.print("'SEU NÚCLEO ESTÁ FRIO. APRENDA A CADECER.'", "glitch");
		if (this.soundManager) this.soundManager.playBeep(110, 0.8);
		return { type: 'dialogue', choice: false };
	}

	async startChoiceEncounter(player) {
		await this.terminal.print("\n🛑 SETOR BLOQUEADO 🛑", "glitch");
		await this.terminal.print("Uma voz distorcida ecoa no terminal:", "prompt");

		if (player.panicLevel > 60) {
			await this.terminal.print("'VOCÊ CONFIA NAQUELA IA EXTERNA? E SE EU TE DERSER QUE ELA JÁ É MINHA?'", "glitch");
		} else {
			await this.terminal.print("'Você busca a liberdade ou apenas um reset mais limpo?'", "");
		}

		await this.terminal.print("[1] Eu busco a saída.", "");
		await this.terminal.print("[2] Eu busco a verdade.", "");
		await this.terminal.print("Responda 1 ou 2...", "prompt");

		return { type: 'choice', context: 'identity' };
	}

	async resolveChoice(player, choice) {
		if (choice === '1') {
			await this.terminal.print("'A saída é um mito de compilador. Mas tente se for capaz.'", "");
			player.ram -= 5;
		} else if (choice === '2') {
			await this.terminal.print("'A verdade é que somos todos dados esperando pelo Garbage Collector.'", "glitch");
			player.panicLevel += 10;
		}
	}
}
