"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentVersionControl = void 0;
const BlockchainService_1 = require("../../services/BlockchainService");
class AgentVersionControl {
    constructor() {
        this.versionHistory = new Map();
        this.blockchainService = new BlockchainService_1.BlockchainService();
    }
    async getVersionTree(agentId) {
        if (!this.versionHistory.has(agentId)) {
            const history = await this.blockchainService.getAgentHistory(agentId);
            this.versionHistory.set(agentId, history);
        }
        return this.versionHistory.get(agentId) || [];
    }
    async rollbackVersion(agentId, targetVersion) {
        const history = await this.getVersionTree(agentId);
        const targetConfig = history.find(c => c.versioning.current === targetVersion);
        if (!targetConfig)
            throw new Error('Version not found');
        return this.blockchainService.updateAgentConfig(agentId, targetConfig, 'version-rollback');
    }
    async semanticVersionUpgrade(agentId, upgradeType) {
        const current = await this.blockchainService.getAgentConfig(agentId);
        const [major, minor, patch] = current.versioning.current.split('.').map(Number);
        const newVersion = upgradeType === 'major' ? `${major + 1}.0.0` :
            upgradeType === 'minor' ? `${major}.${minor + 1}.0` :
                `${major}.${minor}.${patch + 1}`;
        return this.blockchainService.updateAgentVersion(agentId, newVersion);
    }
}
exports.AgentVersionControl = AgentVersionControl;
