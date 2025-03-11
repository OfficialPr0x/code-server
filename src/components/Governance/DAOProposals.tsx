import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { AgentDAO } from '../../contracts/AgentDAO';

const DAOProposals: React.FC = () => {
  const { provider, account } = useWeb3();
  const [daoContract] = useState(new AgentDAO(provider));
  const [proposals, setProposals] = useState<any[]>([]);
  const [votingPower, setVotingPower] = useState(0);

  useEffect(() => {
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

  const handleVote = async (proposalId: number, support: boolean) => {
    const tx = await daoContract.castVote(proposalId, support);
    await tx.wait();
    // Refresh proposal state
  };

  return (
    <div className="gold-dao-container">
      <h2>Governance Proposals</h2>
      <div className="voting-power-display">
        <span>Your Voting Power: {votingPower}</span>
      </div>
      
      <div className="proposal-list">
        {proposals.map((proposal, index) => (
          <div key={index} className="gold-proposal-card">
            <h3>{proposal.description}</h3>
            <div className="proposal-metrics">
              <span>For: {proposal.forVotes}</span>
              <span>Against: {proposal.againstVotes}</span>
            </div>
            <div className="proposal-actions">
              <button 
                className="gold-success-button"
                onClick={() => handleVote(index, true)}
              >
                Support
              </button>
              <button
                className="gold-danger-button"
                onClick={() => handleVote(index, false)}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 