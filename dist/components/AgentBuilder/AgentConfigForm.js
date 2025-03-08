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
const AgentConfigForm = ({ initialConfig, onSave }) => {
    const [config, setConfig] = (0, react_1.useState)(initialConfig || {
        id: '',
        name: '',
        description: '',
        capabilities: [],
        rarity: 'common',
        algorithm: { type: 'neural', complexity: 1, trainingDataHash: '' },
        securityProtocols: [],
        ownership: { currentOwner: '', ownershipHistory: [] },
        deployment: { environments: [], currentEnv: 'dev', containerSpec: '' },
        performanceMetrics: { accuracy: 0, speed: 0, reliability: 0 },
        economicModel: { tokenStandard: 'ERC-20', rewardStructure: '', stakingRequirements: 0 },
        governance: { votingSystem: 'quadratic' },
        training: { datasets: [], lastTrained: new Date(), trainingCost: 0 },
        plugins: { approved: [], blacklisted: [] },
        network: { peers: [], reputationScore: 0 },
        versioning: { current: '1.0.0', updateHistory: [] }
    });
    // Implement form validation and submission logic
    // Connect to IPFS for config storage
    // Integrate with NFT minting functionality
    return (<div className="agent-builder-panel">
      <div className="gold-panel-header">
        <h2>Agent Configuration Builder</h2>
        <div className="complexity-meter">
          <span>Complexity Level: {config.algorithm.complexity}</span>
          <div className="gold-progress-bar">
            <div style={{ width: `${config.algorithm.complexity * 10}%` }} className="gold-progress-fill"></div>
          </div>
        </div>
      </div>
      
      <div className="builder-section">
        <h3>Core Identity</h3>
        <div className="gold-input-group">
          <label>Agent Name</label>
          <input type="text" value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} className="gold-themed-input"/>
        </div>
        {/* More form elements following the theme */}
      </div>
      
      <div className="security-section">
        <h3>Security Protocols</h3>
        <div className="protocol-grid">
          {['encryptedStorage', 'multiSig', 'auditTrail'].map(protocol => (<div key={protocol} className={`protocol-card ${config.securityProtocols.includes(protocol) ? 'active' : ''}`} onClick={() => toggleProtocol(protocol)}>
              <div className="protocol-icon"></div>
              <span>{protocol}</span>
            </div>))}
        </div>
      </div>
      
      <button className="gold-action-button" onClick={() => onSave(config)}>
        Deploy Agent Configuration
      </button>
    </div>);
};
