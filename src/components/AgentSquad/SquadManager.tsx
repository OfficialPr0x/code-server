import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { AgentConfig } from '../../modules/agent/config/AgentCoreTypes';

const SquadManager: React.FC = () => {
  const { account, provider } = useWeb3();
  const [squads, setSquads] = useState<AgentConfig[][]>([]);
  const [selectedAgents, setSelectedAgents] = useState<AgentConfig[]>([]);

  const formSquad = async () => {
    const synergyScore = calculateSynergy(selectedAgents);
    if (synergyScore < 0.7) {
      alert('Minimum 70% synergy required');
      return;
    }
    
    const tx = await provider.send('squad_form', [selectedAgents.map(a => a.id)]);
    await tx.wait();
    setSquads([...squads, selectedAgents]);
  };

  const calculateSynergy = (agents: AgentConfig[]) => {
    const capabilityMatrix = agents.flatMap(a => a.capabilities);
    const uniqueCapabilities = new Set(capabilityMatrix);
    return uniqueCapabilities.size / (agents.length * 2);
  };

  return (
    <div className="gold-squad-container">
      <h2>Squad Formation Interface</h2>
      <div className="squad-composer">
        <div className="agent-selection-panel">
          {selectedAgents.map(agent => (
            <div key={agent.id} className="selected-agent-card">
              <span>{agent.name}</span>
              <button onClick={() => setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id))}>
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="synergy-meter">
          <span>Synergy Score: {calculateSynergy(selectedAgents) * 100}%</span>
          <div className="gold-progress-bar">
            <div style={{ width: `${calculateSynergy(selectedAgents) * 100}%` }}></div>
          </div>
        </div>
        <button 
          className="gold-action-button"
          onClick={formSquad}
          disabled={selectedAgents.length < 2}
        >
          Deploy Squad
        </button>
      </div>
    </div>
  );
}; 