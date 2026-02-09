import { Terminal } from './ui/Terminal.js';
import { Game } from './core/Game.js';
import { SoundManager } from './audio/SoundManager.js';
import { CRTManager } from './ui/CRTManager.js';

window.addEventListener('DOMContentLoaded', () => {
	const soundManager = new SoundManager();
	const crtManager = new CRTManager();
	const terminal = new Terminal('terminal', 'cmd-input', 'input-area', soundManager);
	const game = new Game(terminal, soundManager, crtManager);
	game.init();
});
