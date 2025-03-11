import React, { useEffect, useState } from 'react';
import { AgentConfig } from '../../modules/agent/config/AgentCoreTypes';
import { MarketplaceService } from '../../services/MarketplaceService';
import { useWeb3 } from '../../contexts/Web3Context';

const AgentMarketplace: React.FC = () => {
  const { provider, account } = useWeb3();
  const [marketplaceService] = useState(new MarketplaceService(provider, 'mainnet'));
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);

  useEffect(() => {
    const loadMarketplace = async () => {
      const listedAgents = await marketplaceService.getListedAgents();
      setAgents(listedAgents);
    };
    loadMarketplace();
  }, []);

  const handlePurchase = async (agentId: string) => {
    const txReceipt = await marketplaceService.purchaseAgent(agentId, account);
    if (txReceipt.status === 1) {
      // Update UI and user inventory
    }
  };

  return (
    <div className="gold-marketplace-container">
      <div className="marketplace-header">
        <h2>AI Agent Marketplace</h2>
        <div className="marketplace-filters">
          <select className="gold-select">
            <option>All Rarities</option>
            <option>Common</option>
            <option>Rare</option>
            <option>Epic</option>
            <option>Legendary</option>
          </select>
          <input 
            type="text" 
            placeholder="Search agents..." 
            className="gold-search-input"
          />
        </div>
      </div>

      <div className="agent-grid">
        {agents.map(agent => (
          <div key={agent.id} className="gold-agent-card">
            <div className="agent-card-header">
              <span className={`rarity-badge ${agent.rarity}`}>
                {agent.rarity}
              </span>
              <h3>{agent.name}</h3>
            </div>
            <div className="agent-stats">
              <div className="stat-item">
                <span>Accuracy</span>
                <div className="gold-progress-bar">
                  <div style={{ width: `${agent.performanceMetrics.accuracy}%` }}></div>
                </div>
              </div>
              <div className="stat-item">
                <span>Speed</span>
                <div className="gold-progress-bar">
                  <div style={{ width: `${agent.performanceMetrics.speed}%` }}></div>
                </div>
              </div>
            </div>
            <button 
              className="gold-action-button"
              onClick={() => handlePurchase(agent.id)}
            >
              Purchase Agent
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentMarketplace; 