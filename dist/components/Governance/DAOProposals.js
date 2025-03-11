"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Web3Context_1 = require("../../contexts/Web3Context");
const AgentDAO_1 = require("../../contracts/AgentDAO");
const DAOProposals = () => {
    const { provider, account } = (0, Web3Context_1.useWeb3)();
    const [daoContract] = (0, react_1.useState)(new AgentDAO_1.AgentDAO(provider));
    const [proposals, setProposals] = (0, react_1.useState)([]);
    const [votingPower, setVotingPower] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const loadProposals = async () => {
            const proposalCount = await daoContract.proposalCount();
            const loadedProposals = [];
            for (let i = 0; i < proposalCount; i++) {
                loadedProposals.push(await daoContract.proposals(i));
            }
            setProposals(loadedProposals);
            setVotingPower(await daoContract.getVotes(account));
        };
        loadProposals();
    }, []);
    const handleVote = async (proposalId, support) => {
        const tx = await daoContract.castVote(proposalId, support);
        await tx.wait();
        // Refresh proposal state
    };
    return (<div className="gold-dao-container">
      <h2>Governance Proposals</h2>
      <div className="voting-power-display">
        <span>Your Voting Power: {votingPower}</span>
      </div>
      
      <div className="proposal-list">
        {proposals.map((proposal, index) => (<div key={index} className="gold-proposal-card">
            <h3>{proposal.description}</h3>
            <div className="proposal-metrics">
              <span>For: {proposal.forVotes}</span>
              <span>Against: {proposal.againstVotes}</span>
            </div>
            <div className="proposal-actions">
              <button className="gold-success-button" onClick={() => handleVote(index, true)}>
                Support
              </button>
              <button className="gold-danger-button" onClick={() => handleVote(index, false)}>
                Reject
              </button>
            </div>
          </div>))}
      </div>
    </div>);
};
