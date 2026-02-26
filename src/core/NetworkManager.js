import Peer from 'peerjs';

export class NetworkManager {
    constructor(game, terminal) {
        this.game = game;
        this.terminal = terminal;
        this.peer = null;
        this.conn = null;
        this.myId = null;
        this.mode = 'offline'; // 'host', 'client', 'offline'
    }

    async initHost() {
        this.mode = 'host';
        // Generate random ID: kp-xxxx
        const id = 'kp-' + Math.floor(Math.random() * 9000 + 1000);
        this.peer = new Peer(id);

        this.peer.on('open', (id) => {
            this.myId = id;
            console.log('Neural Link ID:', id);
            this.terminal.print(`ID DE LINK: [ ${id} ]`, "code");
            const link = `${window.location.origin}/?join=${id}`;
            this.terminal.print(`Link direto: ${link}`, "prompt");
        });

        this.peer.on('connection', (conn) => {
            this.conn = conn;
            this.setupConnection();
            this.terminal.print("⚠️ EXTERNAL NEURAL CONNECTION ESTABLISHED.", "glitch");
            this.terminal.print(`Operador remoto conectado.`, "prompt");
        });

        this.peer.on('error', (err) => {
             this.terminal.print("ERRO DE REDE: " + err.type, "glitch");
        });
    }

    async initClient(hostId) {
        this.mode = 'client';
        this.peer = new Peer(); // Auto ID

        this.peer.on('open', () => {
            this.conn = this.peer.connect(hostId);
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            this.terminal.print("CONNECTION ERROR: " + err.type, "glitch");
        });
    }

    setupConnection() {
        if (!this.conn) return;

        this.conn.on('data', (data) => {
            this.handleData(data);
        });

        this.conn.on('open', () => {
            if (this.mode === 'host') {
                this.broadcast({ type: 'sys_log', msg: 'Neural synchronization started.' });
            } else {
                this.terminal.print("CONECTADO AO MAINFRAME CENTRAL.", "glitch");
                this.terminal.print("Modo de Operador Remoto Ativado.", "prompt");
                // Activate UI if available
                if (this.game.uiManager && this.game.uiManager.showHackerPanel) {
                    this.game.uiManager.showHackerPanel(this);
                } else {
                    this.terminal.print("Available commands: scan, boost, panic", "code");
                }
            }
        });
    }

    broadcast(data) {
        if (this.conn && this.conn.open) {
            this.conn.send(data);
        }
    }

    handleData(data) {
        // Log feed logic
        if (data.type === 'sys_log') {
            if (this.game.uiManager && this.game.uiManager.updateRemoteLog) {
                this.game.uiManager.updateRemoteLog(data.msg);
            } else {
                this.terminal.print(`LOG REMOTO: ${data.msg}`, "prompt");
            }
        }
        
        // Host handling commands from Client

        if (this.mode === 'host') {
            if (data.type === 'cmd_boost') {
                this.game.player.ram = Math.min(this.game.player.maxRam, this.game.player.ram + 15);
                this.terminal.print("⚡ RAM BOOST RECEBIDO DO OPERADOR.", "glitch");
                if (this.game.soundManager) this.game.soundManager.playBeep(880, 0.2);
            }
            if (data.type === 'cmd_panic') {
                this.game.player.panicLevel += 10;
                this.terminal.print("💀 THE OPERATOR CAUSED A VOLTAGE SPIKE!", "glitch");
                if (this.game.crtManager) this.game.crtManager.triggerGlitch(500);
            }
            if (data.type === 'cmd_scan') {
                const room = this.game.world.generateRoom(this.game.player.x, this.game.player.y);
                const item = room.item || 'Nenhum objeto';
                this.broadcast({ type: 'sys_log', msg: `SCAN RESULT: ${item}` });
                this.terminal.print("👁️ SCAN REMOTO EXECUTADO.", "prompt");
            }
        }

        // Client receiving updates
        if (this.mode === 'client') {
            // Client specific logic if needed
        }
    }

    sendCommand(cmd) {
        if (this.mode === 'client') {
            this.conn.send({ type: `cmd_${cmd}` });
            this.terminal.print(`Comando enviando: ${cmd}...`, "prompt");
        }
    }
}
