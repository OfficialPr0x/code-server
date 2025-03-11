"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveMonitor = void 0;
const ws_1 = require("ws");
const BlockchainService_1 = require("../../services/BlockchainService");
class LiveMonitor {
    constructor(port) {
        this.wss = new ws_1.WebSocketServer({ port });
        this.blockchainService = new BlockchainService_1.BlockchainService();
        this.setupListeners();
    }
    setupListeners() {
        this.blockchainService.on('transaction', (txData) => {
            this.broadcast('transaction', txData);
        });
        this.blockchainService.on('agentUpdate', (agentData) => {
            this.broadcast('agentUpdate', agentData);
        });
    }
    broadcast(event, data) {
        this.wss.clients.forEach(client => {
            client.send(JSON.stringify({ event, data }));
        });
    }
}
exports.LiveMonitor = LiveMonitor;
