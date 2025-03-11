import React, { useState, useEffect } from 'react';
import { useWeb3Context } from '../../contexts/Web3Context';
import { AgentDAO, Proposal } from '../../../src/contracts/AgentDAO';

export function DAOProposals() {
  const { account, isConnected } = useWeb3Context();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: ''
  });
  const [dao, setDao] = useState<AgentDAO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize DAO
    const agentDao = new AgentDAO();
    setDao(agentDao);

    // Load proposals
    const loadProposals = async () => {
      try {
        setLoading(true);
        const proposalsList = await agentDao.getProposals();
        setProposals(proposalsList);
      } catch (error) {
        console.error('Error loading proposals:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProposals();
  }, []);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dao || !isConnected || !account) return;

    try {
      setLoading(true);
      const proposal = await dao.createProposal(
        newProposal.title,
        newProposal.description,
        account
      );
      setProposals([...proposals, proposal]);
      setNewProposal({ title: '', description: '' });
    } catch (error) {
      console.error('Error creating proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!dao || !isConnected || !account) return;

    try {
      setLoading(true);
      await dao.vote(proposalId, support, account);
      
      // Refresh proposals
      const updatedProposals = await dao.getProposals();
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Error voting on proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async (proposalId: number) => {
    if (!dao || !isConnected) return;

    try {
      setLoading(true);
      await dao.executeProposal(proposalId);
      
      // Refresh proposals
      const updatedProposals = await dao.getProposals();
      setProposals(updatedProposals);
    } catch (error) {
      console.error('Error executing proposal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dao-proposals">
      <h2>Governance Proposals</h2>
      
      {isConnected ? (
        <>
          <form onSubmit={handleSubmitProposal} className="proposal-form">
            <div className="form-group">
              <label htmlFor="title">Proposal Title</label>
              <input
                type="text"
                id="title"
                value={newProposal.title}
                onChange={e => setNewProposal({ ...newProposal, title: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newProposal.description}
                onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </form>
          
          <div className="proposals-list">
            <h3>Active Proposals</h3>
            
            {loading ? (
              <div className="loading">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="no-proposals">No proposals found</div>
            ) : (
              proposals.map(proposal => (
                <div key={proposal.id} className={`proposal-card ${proposal.status}`}>
                  <h4>{proposal.title}</h4>
                  <p className="proposal-description">{proposal.description}</p>
                  
                  <div className="proposal-meta">
                    <div className="proposal-votes">
                      <div className="vote-count for">
                        <span className="vote-label">For:</span>
                        <span className="vote-number">{proposal.forVotes}</span>
                      </div>
                      <div className="vote-count against">
                        <span className="vote-label">Against:</span>
                        <span className="vote-number">{proposal.againstVotes}</span>
                      </div>
                    </div>
                    
                    <div className="proposal-status">
                      Status: <span className={proposal.status}>{proposal.status}</span>
                    </div>
                  </div>
                  
                  <div className="proposal-actions">
                    {proposal.status === 'active' && (
                      <>
                        <button 
                          onClick={() => handleVote(proposal.id, true)}
                          className="vote-for"
                          disabled={loading}
                        >
                          Vote For
                        </button>
                        <button 
                          onClick={() => handleVote(proposal.id, false)}
                          className="vote-against"
                          disabled={loading}
                        >
                          Vote Against
                        </button>
                      </>
                    )}
                    
                    {proposal.status === 'passed' && (
                      <button 
                        onClick={() => handleExecute(proposal.id)}
                        className="execute"
                        disabled={loading}
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to participate in governance</p>
        </div>
      )}
    </div>
  );
}
