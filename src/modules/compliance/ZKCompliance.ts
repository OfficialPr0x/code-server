import { zkSnark } from 'snarkjs';
import { AgentConfig } from '../config/AgentCoreTypes';

export class ZKComplianceService {
    private circuit: any;
    private verificationKey: any;

    async initialize() {
        [this.circuit, this.verificationKey] = await Promise.all([
            fetch('/circuit.json').then(res => res.json()),
            fetch('/verification_key.json').then(res => res.json())
        ]);
    }

    async generateKYCProof(userData: any, agentConfig: AgentConfig) {
        const { proof, publicSignals } = await zkSnark.groth16.fullProve(
            { ...userData, agent: agentConfig.id },
            this.circuit,
            this.verificationKey
        );
        
        return { proof, publicSignals };
    }

    async verifyKYCCredential(proof: any, publicSignals: any) {
        return zkSnark.groth16.verify(
            this.verificationKey,
            publicSignals,
            proof
        );
    }
} 