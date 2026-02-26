import { Terminal } from './ui/Terminal.js';
import { Game } from './core/Game.js';
import { SoundManager } from './audio/SoundManager.js';
import { CRTManager } from './ui/CRTManager.js';

class UIManager {
    constructor(terminal) {
        this.terminal = terminal;
        this.hackerPanel = null;
    }

    updateRemoteLog(msg) {
        if (this.hackerPanel) {
            const logArea = this.hackerPanel.querySelector('.hacker-log');
            const entry = document.createElement('div');
            entry.textContent = `> ${msg}`;
            logArea.appendChild(entry);
            logArea.scrollTop = logArea.scrollHeight;
        }
    }

    showHackerPanel(networkManager) {
        const panel = document.createElement('div');
        panel.className = 'hacker-panel';
        panel.innerHTML = `
            <div class="hacker-header">=== TERMINAL DE SUPORTE ===</div>
            <div class="hacker-log"></div>
            <div class="hacker-controls">
                <button id="btn-boost" class="btn-hack">⚡ RAM BOOST</button>
                <button id="btn-scan" class="btn-hack">👁️ SCAN</button>
                <button id="btn-panic" class="btn-hack">💀 PANIC</button>
            </div>
        `;
        document.body.appendChild(panel);
        this.hackerPanel = panel;

        document.getElementById('btn-boost').onclick = () => {
            networkManager.broadcast({ type: 'cmd_boost' });
            this.updateRemoteLog('Enviando pacote de RAM...');
        };
        document.getElementById('btn-scan').onclick = () => {
            networkManager.broadcast({ type: 'cmd_scan' });
            this.updateRemoteLog('Solicitando varredura...');
        };
        document.getElementById('btn-panic').onclick = () => {
            networkManager.broadcast({ type: 'cmd_panic' });
            this.updateRemoteLog('Injecting noise into the system...');
        };
    }
}

window.addEventListener('DOMContentLoaded', () => {
	const soundManager = new SoundManager();
	const crtManager = new CRTManager();
	const terminal = new Terminal('terminal', 'cmd-input', 'input-area', soundManager);
    const uiManager = new UIManager(terminal);
	const game = new Game(terminal, soundManager, crtManager, uiManager);
	game.init();
});
