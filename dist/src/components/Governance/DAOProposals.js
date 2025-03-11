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
exports.DAOProposals = DAOProposals;
const react_1 = __importStar(require("react"));
const Web3Context_1 = require("../../contexts/Web3Context");
const AgentDAO_1 = require("../../../src/contracts/AgentDAO");
function DAOProposals() {
    const { account, isConnected } = (0, Web3Context_1.useWeb3Context)();
    const [proposals, setProposals] = (0, react_1.useState)([]);
    const [newProposal, setNewProposal] = (0, react_1.useState)({
        title: '',
        description: ''
    });
    const [dao, setDao] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Initialize DAO
        const agentDao = new AgentDAO_1.AgentDAO();
        setDao(agentDao);
        // Load proposals
        const loadProposals = async () => {
            try {
                setLoading(true);
                const proposalsList = await agentDao.getProposals();
                setProposals(proposalsList);
            }
            catch (error) {
                console.error('Error loading proposals:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadProposals();
    }, []);
    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        if (!dao || !isConnected || !account)
            return;
        try {
            setLoading(true);
            const proposal = await dao.createProposal(newProposal.title, newProposal.description, account);
            setProposals([...proposals, proposal]);
            setNewProposal({ title: '', description: '' });
        }
        catch (error) {
            console.error('Error creating proposal:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleVote = async (proposalId, support) => {
        if (!dao || !isConnected || !account)
            return;
        try {
            setLoading(true);
            await dao.vote(proposalId, support, account);
            // Refresh proposals
            const updatedProposals = await dao.getProposals();
            setProposals(updatedProposals);
        }
        catch (error) {
            console.error('Error voting on proposal:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleExecute = async (proposalId) => {
        if (!dao || !isConnected)
            return;
        try {
            setLoading(true);
            await dao.executeProposal(proposalId);
            // Refresh proposals
            const updatedProposals = await dao.getProposals();
            setProposals(updatedProposals);
        }
        catch (error) {
            console.error('Error executing proposal:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return (react_1.default.createElement("div", { className: "dao-proposals" },
        react_1.default.createElement("h2", null, "Governance Proposals"),
        isConnected ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("form", { onSubmit: handleSubmitProposal, className: "proposal-form" },
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", { htmlFor: "title" }, "Proposal Title"),
                    react_1.default.createElement("input", { type: "text", id: "title", value: newProposal.title, onChange: e => setNewProposal({ ...newProposal, title: e.target.value }), required: true })),
                react_1.default.createElement("div", { className: "form-group" },
                    react_1.default.createElement("label", { htmlFor: "description" }, "Description"),
                    react_1.default.createElement("textarea", { id: "description", value: newProposal.description, onChange: e => setNewProposal({ ...newProposal, description: e.target.value }), rows: 4, required: true })),
                react_1.default.createElement("button", { type: "submit", disabled: loading }, loading ? 'Submitting...' : 'Submit Proposal')),
            react_1.default.createElement("div", { className: "proposals-list" },
                react_1.default.createElement("h3", null, "Active Proposals"),
                loading ? (react_1.default.createElement("div", { className: "loading" }, "Loading proposals...")) : proposals.length === 0 ? (react_1.default.createElement("div", { className: "no-proposals" }, "No proposals found")) : (proposals.map(proposal => (react_1.default.createElement("div", { key: proposal.id, className: `proposal-card ${proposal.status}` },
                    react_1.default.createElement("h4", null, proposal.title),
                    react_1.default.createElement("p", { className: "proposal-description" }, proposal.description),
                    react_1.default.createElement("div", { className: "proposal-meta" },
                        react_1.default.createElement("div", { className: "proposal-votes" },
                            react_1.default.createElement("div", { className: "vote-count for" },
                                react_1.default.createElement("span", { className: "vote-label" }, "For:"),
                                react_1.default.createElement("span", { className: "vote-number" }, proposal.forVotes)),
                            react_1.default.createElement("div", { className: "vote-count against" },
                                react_1.default.createElement("span", { className: "vote-label" }, "Against:"),
                                react_1.default.createElement("span", { className: "vote-number" }, proposal.againstVotes))),
                        react_1.default.createElement("div", { className: "proposal-status" },
                            "Status: ",
                            react_1.default.createElement("span", { className: proposal.status }, proposal.status))),
                    react_1.default.createElement("div", { className: "proposal-actions" },
                        proposal.status === 'active' && (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement("button", { onClick: () => handleVote(proposal.id, true), className: "vote-for", disabled: loading }, "Vote For"),
                            react_1.default.createElement("button", { onClick: () => handleVote(proposal.id, false), className: "vote-against", disabled: loading }, "Vote Against"))),
                        proposal.status === 'passed' && (react_1.default.createElement("button", { onClick: () => handleExecute(proposal.id), className: "execute", disabled: loading }, "Execute")))))))))) : (react_1.default.createElement("div", { className: "connect-prompt" },
            react_1.default.createElement("p", null, "Please connect your wallet to participate in governance")))));
}
