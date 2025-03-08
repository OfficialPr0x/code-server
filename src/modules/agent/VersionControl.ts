import { AgentConfig } from './config/AgentCoreTypes';
import { BlockchainService } from '../../services/BlockchainService';

export class AgentVersionControl {
    private blockchainService: BlockchainService;
    private versionHistory = new Map<string, AgentConfig[]>();

    constructor() {
        this.blockchainService = new BlockchainService();
    }

    async getVersionTree(agentId: string) {
        if (!this.versionHistory.has(agentId)) {
            const history = await this.blockchainService.getAgentHistory(agentId);
            this.versionHistory.set(agentId, history);
        }
        return this.versionHistory.get(agentId) || [];
    }

    async rollbackVersion(agentId: string, targetVersion: string) {
        const history = await this.getVersionTree(agentId);
        const targetConfig = history.find(c => c.versioning.current === targetVersion);
        
        if (!targetConfig) throw new Error('Version not found');
        
        return this.blockchainService.updateAgentConfig(
            agentId,
            targetConfig,
            'version-rollback'
        );
    }

    async semanticVersionUpgrade(agentId: string, upgradeType: 'major' | 'minor' | 'patch') {
        const current = await this.blockchainService.getAgentConfig(agentId);
        const [major, minor, patch] = current.versioning.current.split('.').map(Number);
        
        const newVersion = upgradeType === 'major' ? `${major+1}.0.0` :
                          upgradeType === 'minor' ? `${major}.${minor+1}.0` :
                          `${major}.${minor}.${patch+1}`;
        
        return this.blockchainService.updateAgentVersion(agentId, newVersion);
    }
} 