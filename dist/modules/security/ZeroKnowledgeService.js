"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZeroKnowledgeService = void 0;
const snarkjs_1 = require("snarkjs");
class ZeroKnowledgeService {
    async initialize(circuitPath, pkPath) {
        this.circuit = await fetch(circuitPath).then(res => res.json());
        this.provingKey = await fetch(pkPath).then(res => res.arrayBuffer());
    }
    async generateProof(privateInputs, publicInputs) {
        const { proof, publicSignals } = await snarkjs_1.groth16.fullProve({ ...privateInputs, ...publicInputs }, this.circuit, new Uint8Array(this.provingKey));
        return { proof, publicSignals };
    }
    async verifyProof(proof, publicSignals) {
        const verificationKey = await fetch('/verification_key.json').then(res => res.json());
        return snarkjs_1.groth16.verify(verificationKey, publicSignals, proof);
    }
}
exports.ZeroKnowledgeService = ZeroKnowledgeService;
