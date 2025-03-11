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
exports.SquadManager = SquadManager;
const react_1 = __importStar(require("react"));
const Web3Context_1 = require("../../contexts/Web3Context");
function SquadManager() {
    const { account, isConnected } = (0, Web3Context_1.useWeb3Context)();
    const [squads, setSquads] = (0, react_1.useState)([]);
    const [selectedSquad, setSelectedSquad] = (0, react_1.useState)(null);
    const [newSquadName, setNewSquadName] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
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
        if (!newSquadName.trim() || !isConnected)
            return;
        const newSquad = {
            id: `squad-${Date.now()}`,
            name: newSquadName,
            agents: [],
            owner: account || '',
            createdAt: new Date()
        };
        setSquads([...squads, newSquad]);
        setNewSquadName('');
    };
    const addAgentToSquad = (squadId, agent) => {
        setSquads(squads.map(squad => {
            if (squad.id === squadId) {
                return {
                    ...squad,
                    agents: [...squad.agents, agent]
                };
            }
            return squad;
        }));
    };
    const removeAgentFromSquad = (squadId, agentId) => {
        setSquads(squads.map(squad => {
            if (squad.id === squadId) {
                return {
                    ...squad,
                    agents: squad.agents.filter(agent => agent.id !== agentId)
                };
            }
            return squad;
        }));
    };
    return (react_1.default.createElement("div", { className: "squad-manager" },
        react_1.default.createElement("h2", null, "Agent Squads"),
        isConnected ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "create-squad" },
                react_1.default.createElement("input", { type: "text", value: newSquadName, onChange: e => setNewSquadName(e.target.value), placeholder: "New Squad Name" }),
                react_1.default.createElement("button", { onClick: createSquad }, "Create Squad")),
            react_1.default.createElement("div", { className: "squads-list" }, squads.map(squad => (react_1.default.createElement("div", { key: squad.id, className: `squad-item ${selectedSquad?.id === squad.id ? 'selected' : ''}`, onClick: () => setSelectedSquad(squad) },
                react_1.default.createElement("h3", null, squad.name),
                react_1.default.createElement("div", { className: "squad-meta" },
                    react_1.default.createElement("span", null,
                        squad.agents.length,
                        " agents"),
                    react_1.default.createElement("span", null,
                        "Created: ",
                        squad.createdAt.toLocaleDateString())))))),
            selectedSquad && (react_1.default.createElement("div", { className: "squad-details" },
                react_1.default.createElement("h3", null,
                    selectedSquad.name,
                    " Details"),
                react_1.default.createElement("div", { className: "agents-list" }, selectedSquad.agents.map(agent => (react_1.default.createElement("div", { key: agent.id, className: "agent-item" },
                    react_1.default.createElement("div", { className: "agent-info" },
                        react_1.default.createElement("h4", null, agent.name),
                        react_1.default.createElement("p", null,
                            "Role: ",
                            agent.role),
                        react_1.default.createElement("div", { className: "agent-capabilities" }, agent.capabilities.map(cap => (react_1.default.createElement("span", { key: cap, className: "capability-tag" }, cap))))),
                    react_1.default.createElement("button", { onClick: () => removeAgentFromSquad(selectedSquad.id, agent.id), className: "remove-agent" }, "Remove"))))))))) : (react_1.default.createElement("div", { className: "connect-prompt" },
            react_1.default.createElement("p", null, "Please connect your wallet to manage agent squads")))));
}
