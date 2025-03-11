"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationOracle = void 0;
const client_1 = require("@chainlink/client");
const AgentReputation_1 = require("../../contracts/AgentReputation");
class ReputationOracle {
    constructor(linkToken, oracleAddress) {
        this.chainlink = new client_1.ChainlinkClient(linkToken);
        this.reputationContract = new AgentReputation_1.AgentReputation(oracleAddress);
    }
    async updateReputationScores(agentIds) {
        const job = await this.chainlink.createJob({
            type: 'reputation-evaluation',
            params: { agents: agentIds }
        });
        const scores = await job.getResult();
        return this.reputationContract.batchUpdateScores(agentIds, scores, this.chainlink.getProof(job.id));
    }
    async getHistoricalReputation(agentId) {
        return this.reputationContract.getFullHistory(agentId);
    }
}
exports.ReputationOracle = ReputationOracle;
