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
exports.AgentMarketplace = AgentMarketplace;
const react_1 = __importStar(require("react"));
const uuid_1 = require("uuid");
const Web3Context_1 = require("../../contexts/Web3Context");
function AgentMarketplace() {
    const { account, isConnected } = (0, Web3Context_1.useWeb3Context)();
    const [templates, setTemplates] = (0, react_1.useState)([]);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [filter, setFilter] = (0, react_1.useState)('all');
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        // Mock data
        const mockTemplates = [
            {
                id: (0, uuid_1.v4)(),
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
                id: (0, uuid_1.v4)(),
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
                id: (0, uuid_1.v4)(),
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
        if (filter === 'all')
            return matchesSearch;
        if (filter === 'free')
            return matchesSearch && template.price === 0;
        if (filter === 'paid')
            return matchesSearch && template.price > 0;
        return matchesSearch;
    });
    const handlePurchase = (templateId) => {
        if (!isConnected) {
            alert('Please connect your wallet to purchase agents');
            return;
        }
        const template = templates.find(t => t.id === templateId);
        if (!template)
            return;
        alert(`Purchased ${template.name} for ${template.price} ETH`);
    };
    return (react_1.default.createElement("div", { className: "agent-marketplace" },
        react_1.default.createElement("h2", null, "Agent Marketplace"),
        react_1.default.createElement("div", { className: "marketplace-controls" },
            react_1.default.createElement("div", { className: "search-bar" },
                react_1.default.createElement("input", { type: "text", placeholder: "Search agents...", value: searchTerm, onChange: e => setSearchTerm(e.target.value) }),
                react_1.default.createElement("i", { className: "search-icon" }, "\uD83D\uDD0D")),
            react_1.default.createElement("div", { className: "filter-controls" },
                react_1.default.createElement("select", { value: filter, onChange: e => setFilter(e.target.value) },
                    react_1.default.createElement("option", { value: "all" }, "All Agents"),
                    react_1.default.createElement("option", { value: "free" }, "Free Agents"),
                    react_1.default.createElement("option", { value: "paid" }, "Paid Agents")))),
        loading ? (react_1.default.createElement("div", { className: "loading" }, "Loading marketplace...")) : filteredTemplates.length === 0 ? (react_1.default.createElement("div", { className: "no-results" }, "No agents found matching your criteria")) : (react_1.default.createElement("div", { className: "templates-grid" }, filteredTemplates.map(template => (react_1.default.createElement("div", { key: template.id, className: "agent-template-card" },
            react_1.default.createElement("div", { className: "agent-template-image" },
                react_1.default.createElement("img", { src: template.image, alt: template.name })),
            react_1.default.createElement("div", { className: "agent-template-content" },
                react_1.default.createElement("h3", null, template.name),
                react_1.default.createElement("p", { className: "agent-template-description" }, template.description),
                react_1.default.createElement("div", { className: "agent-template-capabilities" }, template.capabilities.map(cap => (react_1.default.createElement("span", { key: cap, className: "capability-tag" }, cap)))),
                react_1.default.createElement("div", { className: "agent-template-meta" },
                    react_1.default.createElement("div", { className: "agent-template-rating" },
                        react_1.default.createElement("span", { className: "rating-stars" }, '★'.repeat(Math.floor(template.rating))),
                        react_1.default.createElement("span", { className: "rating-number" }, template.rating.toFixed(1))),
                    react_1.default.createElement("div", { className: "agent-template-downloads" },
                        react_1.default.createElement("i", { className: "download-icon" }, "\u2193"),
                        react_1.default.createElement("span", null, template.downloads))),
                react_1.default.createElement("div", { className: "agent-template-footer" },
                    react_1.default.createElement("div", { className: "agent-template-price" }, template.price > 0 ? `${template.price} ETH` : 'Free'),
                    react_1.default.createElement("button", { className: "purchase-button", onClick: () => handlePurchase(template.id) }, template.price > 0 ? 'Purchase' : 'Download'))))))))));
}
