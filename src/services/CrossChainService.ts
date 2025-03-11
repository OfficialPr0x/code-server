import { Chain, Alchemy } from 'alchemy-sdk';

export class CrossChainService {
  private alchemyInstances: Map<number, Alchemy>;

  constructor(networks: { [chainId: number]: any }) {
    this.alchemyInstances = new Map();
    Object.entries(networks).forEach(([chainId, config]) => {
      this.alchemyInstances.set(parseInt(chainId), new Alchemy(config));
    });
  }

  async bridgeAgent(tokenId: number, fromChain: number, toChain: number) {
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