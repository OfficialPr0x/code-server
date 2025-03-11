"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MPCServerCluster = void 0;
const core_1 = require("@mpc-engine/core");
const HSMIntegration_1 = require("./HSMIntegration");
class MPCServerCluster {
    constructor(nodeCount, hsmConfig) {
        this.hsmService = new HSMIntegration_1.HSMService(hsmConfig);
        this.servers = Array.from({ length: nodeCount }, () => new core_1.MPCServer());
    }
    async initializeThresholdSignature() {
        const hsmKey = await this.hsmService.getHSMKey();
        return this.servers[0].initThresholdSigScheme(this.servers.length, Math.ceil(this.servers.length * 0.67), hsmKey);
    }
    async generateSignatureShare(dataHash) {
        return Promise.all(this.servers.map(server => this.hsmService.secureKeyOperation(() => server.createSignatureShare(dataHash))));
    }
    async combineShares(shares) {
        return this.servers[0].combineSignatureShares(shares);
    }
}
exports.MPCServerCluster = MPCServerCluster;
