import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWeb3Context } from '../../contexts/Web3Context';

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  price: number;
  creator: string;
  rating: number;
  downloads: number;
  image: string;
}

export function AgentMarketplace() {
  const { account, isConnected } = useWeb3Context();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data
    const mockTemplates: AgentTemplate[] = [
      {
        id: uuidv4(),
        name: 'Data Analyst Agent',
        description: 'Specialized in data processing and visualization',
        capabilities: ['data-analysis', 'visualization', 'reporting'],
        price: 0.05,
        creator: '0x1234567890abcdef1234567890abcdef12345678',
        rating: 4.5,
        downloads: 1250,
        image: 'https://via.placeholder.com/150?text=Data+Analyst'
      },
      {
        id: uuidv4(),
        name: 'Code Assistant',
        description: 'Helps with coding tasks and code reviews',
        capabilities: ['code-generation', 'debugging', 'optimization'],
        price: 0.08,
        creator: '0x2345678901abcdef2345678901abcdef23456789',
        rating: 4.8,
        downloads: 3200,
        image: 'https://via.placeholder.com/150?text=Code+Assistant'
      },
      {
        id: uuidv4(),
        name: 'Research Agent',
        description: 'Gathers and summarizes information from various sources',
        capabilities: ['web-search', 'summarization', 'fact-checking'],
        price: 0.03,
        creator: '0x3456789012abcdef3456789012abcdef34567890',
        rating: 4.2,
        downloads: 980,
        image: 'https://via.placeholder.com/150?text=Research+Agent'
      }
    ];

    setTemplates(mockTemplates);
    setLoading(false);
  }, []);

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'free') return matchesSearch && template.price === 0;
    if (filter === 'paid') return matchesSearch && template.price > 0;
    
    return matchesSearch;
  });

  const handlePurchase = (templateId: string) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase agents');
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    alert(`Purchased ${template.name} for ${template.price} ETH`);
  };

  return (
    <div className="agent-marketplace">
      <h2>Agent Marketplace</h2>
      
      <div className="marketplace-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <i className="search-icon">🔍</i>
        </div>
        
        <div className="filter-controls">
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Agents</option>
            <option value="free">Free Agents</option>
            <option value="paid">Paid Agents</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading marketplace...</div>
      ) : filteredTemplates.length === 0 ? (
        <div className="no-results">No agents found matching your criteria</div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(template => (
            <div key={template.id} className="agent-template-card">
              <div className="agent-template-image">
                <img src={template.image} alt={template.name} />
              </div>
              
              <div className="agent-template-content">
                <h3>{template.name}</h3>
                <p className="agent-template-description">{template.description}</p>
                
                <div className="agent-template-capabilities">
                  {template.capabilities.map(cap => (
                    <span key={cap} className="capability-tag">{cap}</span>
                  ))}
                </div>
                
                <div className="agent-template-meta">
                  <div className="agent-template-rating">
                    <span className="rating-stars">{'★'.repeat(Math.floor(template.rating))}</span>
                    <span className="rating-number">{template.rating.toFixed(1)}</span>
                  </div>
                  <div className="agent-template-downloads">
                    <i className="download-icon">↓</i>
                    <span>{template.downloads}</span>
                  </div>
                </div>
                
                <div className="agent-template-footer">
                  <div className="agent-template-price">
                    {template.price > 0 ? `${template.price} ETH` : 'Free'}
                  </div>
                  <button 
                    className="purchase-button"
                    onClick={() => handlePurchase(template.id)}
                  >
                    {template.price > 0 ? 'Purchase' : 'Download'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
