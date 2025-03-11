"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossChainService = void 0;
const alchemy_sdk_1 = require("alchemy-sdk");
class CrossChainService {
    constructor(networks) {
        this.alchemyInstances = new Map();
        Object.entries(networks).forEach(([chainId, config]) => {
            this.alchemyInstances.set(parseInt(chainId), new alchemy_sdk_1.Alchemy(config));
        });
    }
    async bridgeAgent(tokenId, fromChain, toChain) {
        const sourceChain = this.alchemyInstances.get(fromChain);
        const destChain = this.alchemyInstances.get(toChain);
        // 1. Lock agent on source chain
        const lockTx = await sourceChain.nft.lockForBridge(tokenId);
        // 2. Generate merkle proof
        const proof = await sourceChain.getProof(tokenId);
        // 3. Mint wrapped agent on destination chain
        const mintTx = await destChain.nft.mintWrapped(tokenId, proof);
        return { lockTx, mintTx };
    }
}
exports.CrossChainService = CrossChainService;
