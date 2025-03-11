import React, { useState, useEffect } from 'react';

interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
  protocols: string[];
  model: string;
}

interface AgentConfigFormProps {
  initialConfig?: AgentConfig;
  onSubmit: (config: AgentConfig) => void;
}

const defaultConfig: AgentConfig = {
  name: '',
  description: '',
  capabilities: [],
  protocols: ['HTTP', 'WebSocket'],
  model: 'gpt-4'
};

export function AgentConfigForm({ initialConfig, onSubmit }: AgentConfigFormProps) {
  const [config, setConfig] = useState<AgentConfig>(initialConfig || defaultConfig);
  const [capability, setCapability] = useState('');

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(config);
  };

  const addCapability = () => {
    if (capability && !config.capabilities.includes(capability)) {
      setConfig({
        ...config,
        capabilities: [...config.capabilities, capability]
      });
      setCapability('');
    }
  };

  const removeCapability = (cap: string) => {
    setConfig({
      ...config,
      capabilities: config.capabilities.filter(c => c !== cap)
    });
  };

  const toggleProtocol = (protocol: string) => {
    if (config.protocols.includes(protocol)) {
      setConfig({
        ...config,
        protocols: config.protocols.filter(p => p !== protocol)
      });
    } else {
      setConfig({
        ...config,
        protocols: [...config.protocols, protocol]
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="agent-config-form">
      <div className="form-group">
        <label htmlFor="name">Agent Name</label>
        <input
          type="text"
          id="name"
          value={config.name}
          onChange={e => setConfig({ ...config, name: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={config.description}
          onChange={e => setConfig({ ...config, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Capabilities</label>
        <div className="capability-input">
          <input
            type="text"
            value={capability}
            onChange={e => setCapability(e.target.value)}
            placeholder="Add capability"
          />
          <button type="button" onClick={addCapability}>Add</button>
        </div>
        <div className="capabilities-list">
          {config.capabilities.map(cap => (
            <div key={cap} className="capability-tag">
              <span>{cap}</span>
              <button type="button" onClick={() => removeCapability(cap)}>×</button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Protocols</label>
        <div className="protocols-list">
          {['HTTP', 'WebSocket', 'MQTT', 'gRPC'].map(protocol => (
            <div key={protocol} className="protocol-checkbox">
              <input
                type="checkbox"
                id={`protocol-${protocol}`}
                checked={config.protocols.includes(protocol)}
                onChange={() => toggleProtocol(protocol)}
              />
              <label htmlFor={`protocol-${protocol}`}>{protocol}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="model">AI Model</label>
        <select
          id="model"
          value={config.model}
          onChange={e => setConfig({ ...config, model: e.target.value })}
        >
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="claude-3-opus">Claude 3 Opus</option>
          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
          <option value="llama-3-70b">Llama 3 70B</option>
        </select>
      </div>

      <button type="submit" className="submit-button">Save Configuration</button>
    </form>
  );
}
