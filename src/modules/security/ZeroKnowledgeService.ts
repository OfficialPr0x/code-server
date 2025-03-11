import { groth16 } from 'snarkjs';

export class ZeroKnowledgeService {
  private circuit: any;
  private provingKey: ArrayBuffer;

  async initialize(circuitPath: string, pkPath: string) {
    this.circuit = await fetch(circuitPath).then(res => res.json());
    this.provingKey = await fetch(pkPath).then(res => res.arrayBuffer());
  }

  async generateProof(privateInputs: any, publicInputs: any) {
    const { proof, publicSignals } = await groth16.fullProve(
      { ...privateInputs, ...publicInputs },
      this.circuit,
      new Uint8Array(this.provingKey)
    );
    
    return { proof, publicSignals };
  }

  async verifyProof(proof: any, publicSignals: any) {
    const verificationKey = await fetch('/verification_key.json').then(res => res.json());
    return groth16.verify(verificationKey, publicSignals, proof);
  }
} 