import { MerkleTree } from 'merkletreejs';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';
import { keccak256 } from 'ethers/lib/utils';

export class AirdropManager {
  private tree: StandardMerkleTree<any>;
  private claims: Map<string, boolean> = new Map();

  constructor(eligibleAddresses: string[]) {
    this.tree = StandardMerkleTree.of(
      eligibleAddresses.map(addr => [addr]),
      ['address']
    );
  }

  generateProof(recipient: string) {
    for (const [i, leaf] of this.tree.entries()) {
      if (leaf[0] === recipient) {
        return this.tree.getProof(i);
      }
    }
    return null;
  }

  verifyClaim(recipient: string, proof: string[]) {
    const hash = keccak256(recipient);
    return MerkleTree.verify(proof, hash, this.tree.getRoot());
  }

  async processClaim(recipient: string, proof: string[]) {
    if (this.claims.get(recipient)) {
      throw new Error('Already claimed');
    }
    
    if (this.verifyClaim(recipient, proof)) {
      this.claims.set(recipient, true);
      return this.distributeRewards(recipient);
    }
    throw new Error('Invalid proof');
  }

  private async distributeRewards(recipient: string) {
    // Implement reward distribution logic
  }
} 