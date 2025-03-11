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
exports.AgentConfigForm = AgentConfigForm;
const react_1 = __importStar(require("react"));
const defaultConfig = {
    name: '',
    description: '',
    capabilities: [],
    protocols: ['HTTP', 'WebSocket'],
    model: 'gpt-4'
};
function AgentConfigForm({ initialConfig, onSubmit }) {
    const [config, setConfig] = (0, react_1.useState)(initialConfig || defaultConfig);
    const [capability, setCapability] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        if (initialConfig) {
            setConfig(initialConfig);
        }
    }, [initialConfig]);
    const handleSubmit = (e) => {
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
    const removeCapability = (cap) => {
        setConfig({
            ...config,
            capabilities: config.capabilities.filter(c => c !== cap)
        });
    };
    const toggleProtocol = (protocol) => {
        if (config.protocols.includes(protocol)) {
            setConfig({
                ...config,
                protocols: config.protocols.filter(p => p !== protocol)
            });
        }
        else {
            setConfig({
                ...config,
                protocols: [...config.protocols, protocol]
            });
        }
    };
    return (react_1.default.createElement("form", { onSubmit: handleSubmit, className: "agent-config-form" },
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { htmlFor: "name" }, "Agent Name"),
            react_1.default.createElement("input", { type: "text", id: "name", value: config.name, onChange: e => setConfig({ ...config, name: e.target.value }), required: true })),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { htmlFor: "description" }, "Description"),
            react_1.default.createElement("textarea", { id: "description", value: config.description, onChange: e => setConfig({ ...config, description: e.target.value }), rows: 3 })),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Capabilities"),
            react_1.default.createElement("div", { className: "capability-input" },
                react_1.default.createElement("input", { type: "text", value: capability, onChange: e => setCapability(e.target.value), placeholder: "Add capability" }),
                react_1.default.createElement("button", { type: "button", onClick: addCapability }, "Add")),
            react_1.default.createElement("div", { className: "capabilities-list" }, config.capabilities.map(cap => (react_1.default.createElement("div", { key: cap, className: "capability-tag" },
                react_1.default.createElement("span", null, cap),
                react_1.default.createElement("button", { type: "button", onClick: () => removeCapability(cap) }, "\u00D7")))))),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", null, "Protocols"),
            react_1.default.createElement("div", { className: "protocols-list" }, ['HTTP', 'WebSocket', 'MQTT', 'gRPC'].map(protocol => (react_1.default.createElement("div", { key: protocol, className: "protocol-checkbox" },
                react_1.default.createElement("input", { type: "checkbox", id: `protocol-${protocol}`, checked: config.protocols.includes(protocol), onChange: () => toggleProtocol(protocol) }),
                react_1.default.createElement("label", { htmlFor: `protocol-${protocol}` }, protocol)))))),
        react_1.default.createElement("div", { className: "form-group" },
            react_1.default.createElement("label", { htmlFor: "model" }, "AI Model"),
            react_1.default.createElement("select", { id: "model", value: config.model, onChange: e => setConfig({ ...config, model: e.target.value }) },
                react_1.default.createElement("option", { value: "gpt-4" }, "GPT-4"),
                react_1.default.createElement("option", { value: "gpt-3.5-turbo" }, "GPT-3.5 Turbo"),
                react_1.default.createElement("option", { value: "claude-3-opus" }, "Claude 3 Opus"),
                react_1.default.createElement("option", { value: "claude-3-sonnet" }, "Claude 3 Sonnet"),
                react_1.default.createElement("option", { value: "llama-3-70b" }, "Llama 3 70B"))),
        react_1.default.createElement("button", { type: "submit", className: "submit-button" }, "Save Configuration")));
}
