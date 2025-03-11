"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaslessTransactionManager = void 0;
const defender_sdk_relay_1 = require("@openzeppelin/defender-sdk-relay");
class GaslessTransactionManager {
    constructor(relayerApiKey, forwarder) {
        this.relayer = new defender_sdk_relay_1.Relayer({ apiKey: relayerApiKey });
        this.forwarderAddress = forwarder;
    }
    async sendGaslessTransaction(agentConfig, encodedCall, signature) {
        const valid = this.verifyForwarderSignature(agentConfig.id, encodedCall, signature);
        if (!valid)
            throw new Error('Invalid signature');
        return this.relayer.sendTransaction({
            to: this.forwarderAddress,
            data: encodedCall,
            speed: 'fast',
            gasLimit: 500000
        });
    }
    verifyForwarderSignature(agentId, encodedCall, signature) {
        // Implement EIP-712 signature verification
    }
}
exports.GaslessTransactionManager = GaslessTransactionManager;
