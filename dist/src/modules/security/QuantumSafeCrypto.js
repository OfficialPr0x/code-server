"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantumSafeManager = void 0;
const dilithium_js_1 = require("dilithium-js");
class QuantumSafeManager {
    constructor() {
        this.dilithium = new dilithium_js_1.Dilithium();
        this.securityManager = new SecurityManager();
    }
    async generateQuantumKeys() {
        const { publicKey, privateKey } = await this.dilithium.keyPair();
        return this.securityManager.encryptKeyPair({ publicKey, privateKey });
    }
    async quantumSign(message, privateKey) {
        return this.dilithium.sign(message, privateKey);
    }
    async quantumVerify(message, signature, publicKey) {
        return this.dilithium.verify(message, signature, publicKey);
    }
    async rotateToQuantumSafe(agentId) {
        const { publicKey, privateKey } = await this.generateQuantumKeys();
        return this.securityManager.updateAgentCrypto(agentId, 'dilithium', publicKey, privateKey);
    }
}
exports.QuantumSafeManager = QuantumSafeManager;
