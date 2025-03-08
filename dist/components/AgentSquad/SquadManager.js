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
const SquadManager = () => {
    const { account, provider } = (0, Web3Context_1.useWeb3)();
    const [squads, setSquads] = (0, react_1.useState)([]);
    const [selectedAgents, setSelectedAgents] = (0, react_1.useState)([]);
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
    const calculateSynergy = (agents) => {
        const capabilityMatrix = agents.flatMap(a => a.capabilities);
        const uniqueCapabilities = new Set(capabilityMatrix);
        return uniqueCapabilities.size / (agents.length * 2);
    };
    return (<div className="gold-squad-container">
      <h2>Squad Formation Interface</h2>
      <div className="squad-composer">
        <div className="agent-selection-panel">
          {selectedAgents.map(agent => (<div key={agent.id} className="selected-agent-card">
              <span>{agent.name}</span>
              <button onClick={() => setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id))}>
                ×
              </button>
            </div>))}
        </div>
        <div className="synergy-meter">
          <span>Synergy Score: {calculateSynergy(selectedAgents) * 100}%</span>
          <div className="gold-progress-bar">
            <div style={{ width: `${calculateSynergy(selectedAgents) * 100}%` }}></div>
          </div>
        </div>
        <button className="gold-action-button" onClick={formSquad} disabled={selectedAgents.length < 2}>
          Deploy Squad
        </button>
      </div>
    </div>);
};
