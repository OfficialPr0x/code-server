"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZKComplianceService = void 0;
const snarkjs_1 = require("snarkjs");
class ZKComplianceService {
    async initialize() {
        [this.circuit, this.verificationKey] = await Promise.all([
            fetch('/circuit.json').then(res => res.json()),
            fetch('/verification_key.json').then(res => res.json())
        ]);
    }
    async generateKYCProof(userData, agentConfig) {
        const { proof, publicSignals } = await snarkjs_1.zkSnark.groth16.fullProve({ ...userData, agent: agentConfig.id }, this.circuit, this.verificationKey);
        return { proof, publicSignals };
    }
    async verifyKYCCredential(proof, publicSignals) {
        return snarkjs_1.zkSnark.groth16.verify(this.verificationKey, publicSignals, proof);
    }
}
exports.ZKComplianceService = ZKComplianceService;
