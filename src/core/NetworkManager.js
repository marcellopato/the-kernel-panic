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
        });

        this.peer.on('connection', (conn) => {
            this.conn = conn;
            this.setupConnection();
            this.terminal.print("⚠️ CONEXÃO NEURAL EXTERNA ESTABELECIDA.", "glitch");
            this.terminal.print(`Operador remoto [${conn.peer}] conectado.`, "prompt");
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
            this.terminal.print("ERRO DE CONEXÃO: " + err.type, "glitch");
        });
    }

    setupConnection() {
        if (!this.conn) return;

        this.conn.on('data', (data) => {
            this.handleData(data);
        });

        this.conn.on('open', () => {
            if (this.mode === 'host') {
                this.broadcast({ type: 'sys_log', msg: 'Sincronização neural iniciada.' });
            } else {
                this.terminal.print("Conectado ao mainframe central.", "prompt");
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
            // Show on UI (HUD corner)
            this.game.uiManager.updateRemoteLog(data.msg);
        }
        
        // Host handling commands from Client
        if (this.mode === 'host') {
            if (data.type === 'cmd_boost') {
                this.game.player.ram = Math.min(100, this.game.player.ram + 15);
                this.terminal.print("⚡ RAM BOOST RECEBIDO DO OPERADOR.", "glitch");
                this.game.soundManager.playBeep(880, 0.2);
            }
            if (data.type === 'cmd_panic') {
                this.game.player.panicLevel += 10;
                this.terminal.print("💀 O OPERADOR CAUSOU UM PICO DE TENSÃO!", "glitch");
                this.game.crtManager.triggerGlitch(500);
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
            // Visualize host actions? (Maybe just text log for now)
        }
    }
}
