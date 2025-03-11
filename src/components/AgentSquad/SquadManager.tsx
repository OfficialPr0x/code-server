import React, { useState, useEffect } from 'react';
import { useWeb3Context } from '../../contexts/Web3Context';

interface Agent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  owner: string;
}

interface Squad {
  id: string;
  name: string;
  agents: Agent[];
  owner: string;
  createdAt: Date;
}

export function SquadManager() {
  const { account, isConnected } = useWeb3Context();
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [newSquadName, setNewSquadName] = useState('');

  useEffect(() => {
    if (isConnected) {
      // Mock data
      setSquads([
        {
          id: '1',
          name: 'Research Squad',
          agents: [
            {
              id: 'agent-1',
              name: 'Data Collector',
              role: 'Researcher',
              capabilities: ['web-search', 'data-analysis'],
              owner: account || ''
            },
            {
              id: 'agent-2',
              name: 'Report Generator',
              role: 'Writer',
              capabilities: ['text-generation', 'summarization'],
              owner: account || ''
            }
          ],
          owner: account || '',
          createdAt: new Date(Date.now() - 86400000 * 7) // 7 days ago
        }
      ]);
    }
  }, [isConnected, account]);

  const createSquad = () => {
    if (!newSquadName.trim() || !isConnected) return;

    const newSquad: Squad = {
      id: `squad-${Date.now()}`,
      name: newSquadName,
      agents: [],
      owner: account || '',
      createdAt: new Date()
    };

    setSquads([...squads, newSquad]);
    setNewSquadName('');
  };

  const addAgentToSquad = (squadId: string, agent: Agent) => {
    setSquads(
      squads.map(squad => {
        if (squad.id === squadId) {
          return {
            ...squad,
            agents: [...squad.agents, agent]
          };
        }
        return squad;
      })
    );
  };

  const removeAgentFromSquad = (squadId: string, agentId: string) => {
    setSquads(
      squads.map(squad => {
        if (squad.id === squadId) {
          return {
            ...squad,
            agents: squad.agents.filter(agent => agent.id !== agentId)
          };
        }
        return squad;
      })
    );
  };

  return (
    <div className="squad-manager">
      <h2>Agent Squads</h2>
      
      {isConnected ? (
        <>
          <div className="create-squad">
            <input
              type="text"
              value={newSquadName}
              onChange={e => setNewSquadName(e.target.value)}
              placeholder="New Squad Name"
            />
            <button onClick={createSquad}>Create Squad</button>
          </div>
          
          <div className="squads-list">
            {squads.map(squad => (
              <div 
                key={squad.id} 
                className={`squad-item ${selectedSquad?.id === squad.id ? 'selected' : ''}`}
                onClick={() => setSelectedSquad(squad)}
              >
                <h3>{squad.name}</h3>
                <div className="squad-meta">
                  <span>{squad.agents.length} agents</span>
                  <span>Created: {squad.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {selectedSquad && (
            <div className="squad-details">
              <h3>{selectedSquad.name} Details</h3>
              <div className="agents-list">
                {selectedSquad.agents.map(agent => (
                  <div key={agent.id} className="agent-item">
                    <div className="agent-info">
                      <h4>{agent.name}</h4>
                      <p>Role: {agent.role}</p>
                      <div className="agent-capabilities">
                        {agent.capabilities.map(cap => (
                          <span key={cap} className="capability-tag">{cap}</span>
                        ))}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeAgentFromSquad(selectedSquad.id, agent.id)}
                      className="remove-agent"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="connect-prompt">
          <p>Please connect your wallet to manage agent squads</p>
        </div>
      )}
    </div>
  );
}
