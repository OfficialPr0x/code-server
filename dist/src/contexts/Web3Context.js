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
exports.Web3Provider = Web3Provider;
exports.useWeb3Context = useWeb3Context;
const react_1 = __importStar(require("react"));
const Web3Context = (0, react_1.createContext)(undefined);
function Web3Provider({ children }) {
    const [account, setAccount] = (0, react_1.useState)(null);
    const [chainId, setChainId] = (0, react_1.useState)(null);
    const [isConnected, setIsConnected] = (0, react_1.useState)(false);
    const connect = async () => {
        try {
            // Mock implementation
            setAccount('0x1234567890abcdef1234567890abcdef12345678');
            setChainId(1);
            setIsConnected(true);
        }
        catch (error) {
            console.error('Error connecting to wallet:', error);
        }
    };
    const disconnect = () => {
        setAccount(null);
        setChainId(null);
        setIsConnected(false);
    };
    const value = {
        account,
        chainId,
        connect,
        disconnect,
        isConnected
    };
    return react_1.default.createElement(Web3Context.Provider, { value: value }, children);
}
function useWeb3Context() {
    const context = (0, react_1.useContext)(Web3Context);
    if (context === undefined) {
        throw new Error('useWeb3Context must be used within a Web3Provider');
    }
    return context;
}
