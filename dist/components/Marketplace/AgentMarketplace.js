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
const MarketplaceService_1 = require("../../services/MarketplaceService");
const Web3Context_1 = require("../../contexts/Web3Context");
const AgentMarketplace = () => {
    const { provider, account } = (0, Web3Context_1.useWeb3)();
    const [marketplaceService] = (0, react_1.useState)(new MarketplaceService_1.MarketplaceService(provider, 'mainnet'));
    const [agents, setAgents] = (0, react_1.useState)([]);
    const [selectedAgent, setSelectedAgent] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const loadMarketplace = async () => {
            const listedAgents = await marketplaceService.getListedAgents();
            setAgents(listedAgents);
        };
        loadMarketplace();
    }, []);
    const handlePurchase = async (agentId) => {
        const txReceipt = await marketplaceService.purchaseAgent(agentId, account);
        if (txReceipt.status === 1) {
            // Update UI and user inventory
        }
    };
    return (<div className="gold-marketplace-container">
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
          <input type="text" placeholder="Search agents..." className="gold-search-input"/>
        </div>
      </div>

      <div className="agent-grid">
        {agents.map(agent => (<div key={agent.id} className="gold-agent-card">
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
            <button className="gold-action-button" onClick={() => handlePurchase(agent.id)}>
              Purchase Agent
            </button>
          </div>))}
      </div>
    </div>);
};
exports.default = AgentMarketplace;
