import { KeyObject, createSign, createVerify } from 'crypto';
import { Dilithium } from 'dilithium-js';

export class QuantumSafeManager {
    private dilithium: Dilithium;
    private securityManager: SecurityManager;

    constructor() {
        this.dilithium = new Dilithium();
        this.securityManager = new SecurityManager();
    }

    async generateQuantumKeys() {
        const { publicKey, privateKey } = await this.dilithium.keyPair();
        return this.securityManager.encryptKeyPair({ publicKey, privateKey });
    }

    async quantumSign(message: Buffer, privateKey: KeyObject) {
        return this.dilithium.sign(message, privateKey);
    }

    async quantumVerify(message: Buffer, signature: Buffer, publicKey: KeyObject) {
        return this.dilithium.verify(message, signature, publicKey);
    }

    async rotateToQuantumSafe(agentId: string) {
        const { publicKey, privateKey } = await this.generateQuantumKeys();
        return this.securityManager.updateAgentCrypto(
            agentId,
            'dilithium',
            publicKey,
            privateKey
        );
    }
} 