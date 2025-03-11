"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FederatedLearningSystem = void 0;
const federated_1 = require("@tensorflow/federated");
const BlockchainService_1 = require("../../services/BlockchainService");
class FederatedLearningSystem {
    constructor() {
        this.modelWeights = new Map();
        this.tf = new federated_1.Tensorflow();
        this.blockchainService = new BlockchainService_1.BlockchainService();
    }
    async startTrainingRound(agentIds) {
        const globalModel = await this.getCurrentGlobalModel();
        const participants = await this.selectParticipants(agentIds);
        const roundResults = await Promise.all(participants.map(agent => this.trainOnAgent(agent, globalModel)));
        return this.aggregateUpdates(roundResults);
    }
    async trainOnAgent(agentId, model) {
        const agentData = await this.blockchainService.getAgentTrainingData(agentId);
        return this.tf.federatedTrain(model, agentData);
    }
    async aggregateUpdates(updates) {
        return this.tf.federatedAverage(updates);
    }
}
exports.FederatedLearningSystem = FederatedLearningSystem;
