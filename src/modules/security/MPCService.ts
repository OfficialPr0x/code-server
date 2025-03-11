import { MPCServer } from '@mpc-engine/core';
import { HSMService } from './HSMIntegration';

export class MPCServerCluster {
    private servers: MPCServer[];
    private hsmService: HSMService;

    constructor(nodeCount: number, hsmConfig: any) {
        this.hsmService = new HSMService(hsmConfig);
        this.servers = Array.from({ length: nodeCount }, () => new MPCServer());
    }

    async initializeThresholdSignature() {
        const hsmKey = await this.hsmService.getHSMKey();
        return this.servers[0].initThresholdSigScheme(
            this.servers.length,
            Math.ceil(this.servers.length * 0.67),
            hsmKey
        );
    }

    async generateSignatureShare(dataHash: string) {
        return Promise.all(
            this.servers.map(server => 
                this.hsmService.secureKeyOperation(() =>
                    server.createSignatureShare(dataHash)
                )
            )
        );
    }

    async combineShares(shares: string[]) {
        return this.servers[0].combineSignatureShares(shares);
    }
} 