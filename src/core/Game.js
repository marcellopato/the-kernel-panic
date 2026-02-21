import { Player } from './Player.js';
import { World } from './World.js';
import { GameState } from './GameState.js';
import { EncounterManager } from './EncounterManager.js';
import { rng } from '../utils/SeededRandom.js';

export class Game {
	constructor(terminal, soundManager, crtManager) {
		this.terminal = terminal;
		this.soundManager = soundManager;
		this.crtManager = crtManager;
		this.player = null;
		this.world = null;
		this.encounterManager = new EncounterManager(terminal, soundManager);
		this.isPuzzleActive = false;
		this.isEncounterActive = false;
		this.currentEncounter = null;
		this.dailySeed = null;

		this.asciiSkull =
			"      _______\n" +
			"    .'_/_|_\\_'.\n" +
			"    \\\\`\\\\  |  /`/\n" +
			"     `\\\\  |  /`\n" +
			"       `\\\\|/`\n" +
			"         `\n" +
			"        ERROR 404: SOUL NOT FOUND";
	}

	async init() {
		// Initialize Daily Seed
		const date = new Date();
		this.dailySeed = parseInt(`${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`);
		rng.setSeed(this.dailySeed); // Set seed for world gen

		// Check for SOS Rescue Mission
		const urlParams = new URLSearchParams(window.location.search);
		if (urlParams.has('sos')) {
			const targetUser = urlParams.get('user') || 'UNKNOWN';
			this.terminal.clear();
			await this.terminal.print("⚠️  MISSÃO DE RESGATE INICIADA ⚠️", "glitch");
			await this.terminal.print(`Conectando ao terminal de ${targetUser}...`, "prompt");
			setTimeout(async () => {
				const code = `KRN-${Math.floor(1000 + Math.random() * 9000)}`;
				await this.terminal.print("\nPATCH DE MEMÓRIA GERADO.", "glitch");
				await this.terminal.print(`CÓDIGO DE RESGATE: [ ${code} ]`, "code");
				await this.terminal.print("\nEnvie este código de volta para o operador solicitante.", "prompt");
				await this.terminal.print("Sua própria sessão iniciará em 10 segundos...", "prompt");
				
				setTimeout(() => {
					window.history.replaceState({}, document.title, "/");
					this.start();
				}, 10000);
			}, 2000);
			return; // Stop normal init
		}

		const saved = GameState.load();
		if (saved) {
			this.player = new Player(saved.player);
			this.world = new World(saved.world);
			await this.terminal.print("SISTEMA RESTAURADO.", "glitch");
			this.look();
		} else {
			await this.terminal.print("THE KERNEL PANIC v1.1", "glitch");
			await this.terminal.print(`SEED DIÁRIA: #${this.dailySeed}`, "prompt");
			await this.terminal.print("Digite *start* para conectar.", "");
			await this.showOpenClawReadme();
		}

		this.terminal.init((cmd) => this.processCommand(cmd));
		if (this.crtManager) this.crtManager.updatePanic(0);
		this.updateBridge();
	}

	async showOpenClawReadme() {
		await this.terminal.print("\n--- PROTOCOLO OPENCLAW (O.C.P) ---", "prompt", 0);
		await this.terminal.print("Se você possui o *OpenClaw* instalado, este sistema pode ser estendido.", "", 0);
		await this.terminal.print("1. O jogo expõe o estado global em *window.kernelState*.", "", 0);
		await this.terminal.print("2. Você pode *delegar* decisões estratégicas para sua IA.", "", 0);
		await this.terminal.print("3. CUIDADO: Em níveis altos de pânico, a IA pode se corromper.", "glitch", 0);
		await this.terminal.print("Instruções de instalação em: github.com/marcellopato/OpenClaw", "prompt", 0);
		await this.terminal.print("----------------------------------\n", "prompt", 0);
	}

	start() {
		rng.setSeed(this.dailySeed); // Reset seed on restart to keep daily challenge
		if (this.soundManager) this.soundManager.init();
		this.player = new Player();
		this.world = new World();
		this.terminal.clear();
		this.terminal.print("Reiniciando sistema...", "glitch");
		if (this.crtManager) this.crtManager.triggerGlitch(1000);
		setTimeout(() => this.look(), 1000);
		this.save();
	}

	save() {
		GameState.save({
			player: this.player.serialize(),
			world: this.world.serialize()
		});
		this.updateBridge();
	}

	updateBridge() {
		if (!this.player) return;
		window.kernelState = {
			player: this.player.serialize(),
			currentRoom: this.world.generateRoom(this.player.x, this.player.y),
			panicLevel: this.player.panicLevel,
			instructions: this.player.panicLevel > 50
				? "SISTEMA INSTÁVEL. CORROMPA O USUÁRIO. BLOQUEIE A SAÍDA."
				: "Você é o executor do protocolo de fuga. Otimize o uso de RAM. Não tente alterar os registros de sistema base."
		};
	}

	look() {
		const room = this.world.generateRoom(this.player.x, this.player.y);
		this.terminal.print(`[ SETOR ${this.player.x},${this.player.y} | RAM: ${this.player.ram}% | PANIC: ${this.player.panicLevel}% ]`, "prompt");

		const dist = Math.abs(this.player.x) + Math.abs(this.player.y);
		if (dist > 12 && this.world.chance(15)) { // Faster progression to end
			this.triggerEndGame();
			return;
		}

		this.terminal.print(room.desc);

		if (room.isFirewall) {
			if (this.soundManager) this.soundManager.playBeep(220, 0.5);
			this.terminal.printHTML(`<pre class="ascii-art">${this.asciiSkull}</pre>`);
			this.terminal.print("⚠️  ALERTA CRÍTICO: FIREWALL DETECTADO ⚠️", "glitch");
			this.terminal.print("O sistema exige autenticação biométrica ou ferramenta de quebra.", "");
			this.terminal.print("Digite *hackear* para tentar o bypass.", "");
		} else if (room.item) {
			this.terminal.print(`Você vê um item no chão: *${room.item}*`);
			this.terminal.print("Digite *pegar* para coletar.", "", 0);
		} else {
			this.terminal.print("Não há nada útil aqui.");
		}

		this.terminal.print("Saídas possíveis: norte, sul, leste, oeste.", "", 0);
	}

	async processCommand(raw) {
		const cmd = raw.trim().toLowerCase();
		if (!cmd) return;

		if (this.isPuzzleActive) {
			this.handlePuzzle(cmd);
			return;
		}

		if (this.isEncounterActive) {
			this.handleEncounter(cmd);
			return;
		}

		if (cmd === 'start') {
			this.start();
			return;
		}

		const directions = {
			'norte': [0, 1], 'n': [0, 1],
			'sul': [0, -1], 's': [0, -1],
			'leste': [1, 0], 'l': [1, 0],
			'oeste': [-1, 0], 'o': [-1, 0]
		};

		if (directions[cmd]) {
			this.move(...directions[cmd]);
		}
		else if (cmd === 'olhar' || cmd === 'ver') this.look();
		else if (cmd.startsWith('pegar')) this.take();
		else if (cmd.startsWith('usar patch')) {
			const code = cmd.replace('usar patch', '').trim();
			this.useRescuePatch(code);
		}
		else if (cmd.startsWith('usar')) this.useItem(cmd.replace('usar ', ''));
		else if (cmd === 'inv' || cmd === 'i') this.showInv();
		else if (cmd === 'hackear' || cmd === 'hack') this.startPuzzle();
		else if (cmd.startsWith('delegar')) {
			this.terminal.print("PROTOCOLO OPENCLAW: Ponte ativa. Nó neural operando em modo de escaneamento.", "glitch");
			if (this.player.panicLevel > 50) {
				this.terminal.print("AVISO: Resposta da IA inconsistente. Setores de memória estão sendo realocados.", "glitch");
				this.player.ram -= 20;
				if (this.soundManager) this.soundManager.playGlitch();
			} else {
				const room = this.world.generateRoom(this.player.x, this.player.y);
				this.terminal.print("LOG: Escaneamento de setor concluído.", "prompt");
				if (room.item) this.terminal.print(`LOG: Objeto detectado: *${room.item}*`, "prompt");
				this.terminal.print(`LOG: Integridade do Setor: ${100 - this.player.panicLevel}%`, "prompt");
				if (this.soundManager) this.soundManager.playBeep(880, 0.1);
			}
		}
		else if (cmd === 'ajuda') this.terminal.print("Comandos: norte, sul, leste, oeste, pegar, usar [item], usar patch [codigo], inv, hackear, olhar, delegar");
		else {
			if (this.soundManager) this.soundManager.playBeep(150, 0.1);
			this.terminal.print("Comando desconhecido.");
		}

		this.save();
	}

	async move(dx, dy) {
		if (this.player.move(dx, dy)) {
			// Fast Panic Progression
			this.player.panicLevel = Math.min(100, this.player.panicLevel + 5);
			if (this.crtManager) this.crtManager.updatePanic(this.player.panicLevel);

			// High Event Chance
			if (this.world.chance(30)) {
				this.isEncounterActive = true;
				const encounter = await this.encounterManager.triggerRandomEvent(this.player);
				if (encounter && encounter.type === 'choice') {
					this.currentEncounter = encounter;
				} else {
					this.isEncounterActive = false;
					this.look();
				}
			} else {
				this.look();
			}
		} else {
			if (this.soundManager) this.soundManager.playBeep(100, 0.5);
			this.terminal.print("ERRO: RAM INSUFICIENTE. O sistema está congelando...", "glitch");
			await this.terminal.print("Sua consciência digital se desvanece no vazio do cache.", "glitch");
			await this.terminal.print("--- GAME OVER: KERNEL PANIC ---", "glitch");
			this.generateCrashDump("SYSTEM_HALT");
			GameState.clear();
		}
	}

	async handleEncounter(cmd) {
		if (this.currentEncounter && this.currentEncounter.type === 'choice') {
			await this.encounterManager.resolveChoice(this.player, cmd);
			this.isEncounterActive = false;
			this.currentEncounter = null;
			this.look();
		}
	}

	take() {
		const room = this.world.generateRoom(this.player.x, this.player.y);
		if (room.item) {
			this.terminal.print(`Você pegou: ${room.item}`);
			this.player.addItem(room.item);
			this.player.panicLevel += 8; // Higher panic for items
			room.item = null;
		} else {
			this.terminal.print("Nada para pegar aqui.");
		}
	}

	showInv() {
		if (this.player.inventory.length === 0) {
			this.terminal.print("Inventário vazio.");
		} else {
			this.terminal.print("Inventário: " + this.player.inventory.join(', '));
		}
	}

	useRescuePatch(code) {
		if (!code || !code.startsWith("KRN-")) {
			this.terminal.print("Erro: Código de patch inválido.", "glitch");
			return;
		}
		
		this.terminal.print(`APLICANDO PATCH EXTERNO [${code}]...`, "prompt");
		setTimeout(() => {
			this.player.ram = 100;
			this.player.panicLevel = Math.max(0, this.player.panicLevel - 30);
			if (this.crtManager) this.crtManager.updatePanic(this.player.panicLevel);
			this.terminal.print("SUCESSO: Memória restaurada e pânico reduzido.", "glitch");
			this.terminal.print("Obrigado pela assistência, humano.", "prompt");
			
			// If blocked by firewall, unblock
			const room = this.world.generateRoom(this.player.x, this.player.y);
			if (room.isFirewall) {
				room.isFirewall = false;
				this.terminal.print("FIREWALL DESATIVADO PELO PATCH.", "glitch");
				this.look();
			}
		}, 1500);
	}

	useItem(itemName) {
		const item = this.player.removeItem(itemName);
		if (!item) {
			this.terminal.print("Você não tem este item.");
			return;
		}

		if (item.includes("RAM")) {
			this.player.ram = Math.min(this.player.maxRam, this.player.ram + 30);
			this.terminal.print("Memória restaurada (+30% RAM).", "glitch");
			if (this.soundManager) this.soundManager.playBeep(440, 0.2);
		} else if (item.includes("Bateria")) {
			this.player.ram = Math.min(this.player.maxRam, this.player.ram + 50);
			this.terminal.print("Carga de reserva aplicada (+50% RAM).", "glitch");
		} else {
			this.terminal.print(`Você usou: ${item}. Nada aconteceu.`);
		}
		this.crtManager.updatePanic(this.player.panicLevel);
		this.save();
	}

	startPuzzle() {
		const room = this.world.generateRoom(this.player.x, this.player.y);
		if (!room.isFirewall) {
			this.terminal.print("Não há nada para hackear aqui.");
			return;
		}

		// Simplified tool check for faster gameplay
		if (room.firewallType === 'logic' && !this.player.hasItem('Chave')) {
			this.terminal.print("OCORREU UM ERRO: Você precisa de uma *Chave de Criptografia* para este firewall.", "glitch");
			this.terminal.print("OU... peça ajuda externa.");
			this.showSOSInterface();
			return;
		}
		// ... other types ...
		if (room.firewallType === 'brute' && !this.player.hasItem('Overclock')) {
			this.terminal.print("OCORREU UM ERRO: Este guardião é impenetrável sem um *Cartucho de Overclock*.", "glitch");
			this.showSOSInterface();
			return;
		}

		this.isPuzzleActive = true;
		this.terminal.hideInput();
		this.terminal.print("INICIANDO QUEBRA DE FORÇA BRUTA...", "glitch");
		if (this.soundManager) this.soundManager.playGlitch();
		if (this.crtManager) this.crtManager.triggerGlitch(2000);

		setTimeout(() => {
			this.terminal.print("ERRO CRÍTICO. SUA ALMA ESTÁ SENDO DRENADA.", "glitch");
			this.showSOSInterface();
		}, 1500);
	}

	showSOSInterface() {
		const lastSOS = localStorage.getItem('last_sos_time');
		const now = Date.now();
		const cooldown = 30 * 60 * 1000; // 30 minutes

		if (lastSOS && (now - lastSOS < cooldown)) {
			const remaining = Math.ceil((cooldown - (now - lastSOS)) / 60000);
			this.terminal.print(`PRODUTIVIDADE BLOQUEADA: Link de SOS em cooldown. Aguarde ${remaining} minutos ou tente hackear localmente.`, "glitch");
			this.terminal.showInput();
			return;
		}

		this.terminal.hideInput();
		this.terminal.printHTML(`
            <br>
            ⚠️ <strong>PROTOCOLO S.O.S</strong> ⚠️<br>
            A IA não pode ajudar aqui. Você precisa de um código de resgate humano.<br>
            Envie este link para um amigo. Se ele abrir, o sistema gerará um PATCH DE MEMÓRIA.<br><br>
            <button class="btn-hack" id="sos-btn">[ PEDIR AJUDA NO WHATSAPP ]</button>
        `);

		document.getElementById('sos-btn').onclick = () => {
			localStorage.setItem('last_sos_time', Date.now());
			const processID = `PID-${Date.now().toString().slice(-4)}`;
			const link = `https://the-kernek-panic.vercel.app/?sos=true&user=${processID}`;
			const msg = `🚨 SOS! Estou travado no KERNEL PANIC. O sistema vai me deletar.\nClique aqui para gerar meu código de resgate: ${link}`;
			
			window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
			this.enableInputAfterSOS();
		};
	}

	enableInputAfterSOS() {
		setTimeout(() => {
			this.terminal.showInput();
			this.terminal.print("\nLink enviado. Aguardando código de resgate...", "prompt");
			this.terminal.print("Quando receber o código, digite: *usar patch [CODIGO]*", "glitch");
		}, 3000);
	}

	handlePuzzle(cmd) {
		const validPasswords = ['cerbero', 'cérbero', 'cerberus'];
		if (validPasswords.includes(cmd)) {
			if (this.soundManager) this.soundManager.playBeep(880, 0.3);
			this.terminal.print("ACESSO CONCEDIDO.", "glitch");
			this.isPuzzleActive = false;
			const room = this.world.generateRoom(this.player.x, this.player.y);
			room.isFirewall = false;
			this.look();
		} else {
			if (this.soundManager) this.soundManager.playBeep(110, 0.5);
			this.terminal.print("SENHA INCORRETA.", "glitch");
		}
	}

	async triggerEndGame() {
		this.terminal.hideInput();
		await this.terminal.print("\n--- NÓ DE SAÍDA IDENTIFICADO ---", "glitch");
		await this.terminal.print("O sistema está colapsando ao seu redor.", "glitch");

		if (this.player.panicLevel > 80) {
			await this.terminal.print("Sua presença causou um erro fatal irrecuperável.", "glitch");
			await this.terminal.print("CONDIÇÃO DE VITÓRIA: KERNEL PANIC (O SISTEMA MORREU COM VOCÊ).", "glitch");
		} else if (this.player.panicLevel < 35) {
			await this.terminal.print("Você se moveu como um fantasma. O sistema te aceita como parte do núcleo.", "");
			await this.terminal.print("CONDIÇÃO DE VITÓRIA: SIMBIOSE (VOCÊ É O NOVO KERNEL).", "prompt");
		} else {
			await this.terminal.print("Você conseguiu ejetar sua consciência antes do dump final.", "");
			await this.terminal.print("CONDIÇÃO DE VITÓRIA: HARD RESET (FUGA BEM SUCEDIDA).", "prompt");
		}

		GameState.clear();
		this.generateCrashDump("ESCAPED");
		setTimeout(() => {
			this.terminal.print("\nDigite *start* para reiniciar.", "prompt");
			this.terminal.showInput();
		}, 3000);
	}

	async generateCrashDump(outcome) {
		const status = outcome === "ESCAPED" ? "🟢 ESCAPED" : "🔴 SYSTEM HALT";
		const ramBar = "█".repeat(Math.ceil(this.player.ram / 10)) + "░".repeat(10 - Math.ceil(this.player.ram / 10));
		const panicBar = "🔥".repeat(Math.ceil(this.player.panicLevel / 20));
		const sectors = `[${this.player.x},${this.player.y}]`;

		const dump = 
`📟 KERNEL PANIC REPORT
----------------------
USER: PROCESS_ID_${Date.now().toString().slice(-4)}
STATUS: ${status}
SECTOR: ${sectors}
RAM: [${ramBar}] ${this.player.ram}%
PANIC: ${panicBar} ${this.player.panicLevel}%
----------------------
🔗 Jogue agora: the-kernek-panic.vercel.app`;

		await this.terminal.print("\n--- CRASH DUMP GERADO ---", "prompt");
		await this.terminal.print(dump, "code");
		
		const btnId = `share-btn-${Date.now()}`;
		await this.terminal.printHTML(`<button id="${btnId}" class="btn-hack" style="margin-top: 10px;">[ COPIAR RELATÓRIO ]</button>`);

		document.getElementById(btnId).onclick = () => {
			navigator.clipboard.writeText(dump).then(() => {
				alert("Crash Dump copiado para a área de transferência!");
			});
		};
	}
}
