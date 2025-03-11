import { ChainlinkClient } from '@chainlink/client';
import { AgentReputation } from '../../contracts/AgentReputation';

export class ReputationOracle {
    private chainlink: ChainlinkClient;
    private reputationContract: AgentReputation;

    constructor(linkToken: string, oracleAddress: string) {
        this.chainlink = new ChainlinkClient(linkToken);
        this.reputationContract = new AgentReputation(oracleAddress);
    }

    async updateReputationScores(agentIds: string[]) {
        const job = await this.chainlink.createJob({
            type: 'reputation-evaluation',
            params: { agents: agentIds }
        });
        
        const scores = await job.getResult();
        return this.reputationContract.batchUpdateScores(
            agentIds,
            scores,
            this.chainlink.getProof(job.id)
        );
    }

    async getHistoricalReputation(agentId: string) {
        return this.reputationContract.getFullHistory(agentId);
    }
} 