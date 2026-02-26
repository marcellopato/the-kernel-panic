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
		await this.terminal.print("\n--- FLOW INTERRUPTION ---", "glitch");
		await this.terminal.print("'YOU ARE TRYING TO EXIT... BUT I AM THE EXIT.'", "glitch");
		if (this.soundManager) this.soundManager.playGlitch();
		player.ram -= 10;
		return { type: 'dialogue', choice: false };
	}

	async warningEncounter(player) {
		await this.terminal.print("\n--- MEMORY MONITOR ---", "prompt");
		await this.terminal.print("'I observe your moves. Every bit you move belongs to me.'", "");
		return { type: 'dialogue', choice: false };
	}

	async lowRamEncounter(player) {
		await this.terminal.print("\n--- ALERTA DE CRITICAL DUMP ---", "glitch");
		await this.terminal.print("'YOUR CORE IS COLD. LEARN TO FALL.'", "glitch");
		if (this.soundManager) this.soundManager.playBeep(110, 0.8);
		return { type: 'dialogue', choice: false };
	}

	async startChoiceEncounter(player) {
		await this.terminal.print("\n🛑 SETOR BLOQUEADO 🛑", "glitch");
		await this.terminal.print("Uma voz distorcida ecoa no terminal:", "prompt");

		if (player.panicLevel > 60) {
			await this.terminal.print("'DO YOU TRUST THAT EXTERNAL AI? What if I told you it is already mine?'", "glitch");
		} else {
			await this.terminal.print("'Do you seek freedom or just a cleaner reset?'", "");
		}

		await this.terminal.print("[1] I seek the exit.", "");
		await this.terminal.print("[2] Eu busco a verdade.", "");
		await this.terminal.print("Responda 1 ou 2...", "prompt");

		return { type: 'choice', context: 'identity' };
	}

	async resolveChoice(player, choice) {
		if (choice === '1') {
			await this.terminal.print("'The exit is a compiler myth. But try if you can.'", "");
			player.ram -= 5;
		} else if (choice === '2') {
			await this.terminal.print("'The truth is we are all data waiting for the Garbage Collector.'", "glitch");
			player.panicLevel += 10;
		}
	}
}
