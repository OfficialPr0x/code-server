"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirdropManager = void 0;
const merkletreejs_1 = require("merkletreejs");
const merkle_tree_1 = require("@openzeppelin/merkle-tree");
const utils_1 = require("ethers/lib/utils");
class AirdropManager {
    constructor(eligibleAddresses) {
        this.claims = new Map();
        this.tree = merkle_tree_1.StandardMerkleTree.of(eligibleAddresses.map(addr => [addr]), ['address']);
    }
    generateProof(recipient) {
        for (const [i, leaf] of this.tree.entries()) {
            if (leaf[0] === recipient) {
                return this.tree.getProof(i);
            }
        }
        return null;
    }
    verifyClaim(recipient, proof) {
        const hash = (0, utils_1.keccak256)(recipient);
        return merkletreejs_1.MerkleTree.verify(proof, hash, this.tree.getRoot());
    }
    async processClaim(recipient, proof) {
        if (this.claims.get(recipient)) {
            throw new Error('Already claimed');
        }
        if (this.verifyClaim(recipient, proof)) {
            this.claims.set(recipient, true);
            return this.distributeRewards(recipient);
        }
        throw new Error('Invalid proof');
    }
    async distributeRewards(recipient) {
        // Implement reward distribution logic
    }
}
exports.AirdropManager = AirdropManager;
