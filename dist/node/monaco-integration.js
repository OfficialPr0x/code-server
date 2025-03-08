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
exports.initializeAIMonaco = initializeAIMonaco;
const monaco = __importStar(require("monaco-editor"));
function initializeAIMonaco() {
    monaco.editor.defineTheme('ai-war-room-theme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'D4AF37' },
            { token: 'string', foreground: 'CE9178' },
            { token: 'number', foreground: 'B5CEA8' },
            { token: 'regexp', foreground: 'D16969' },
            { token: 'type', foreground: '9CDCFE' },
            { token: 'function', foreground: 'DCDCAA' },
            { token: 'variable', foreground: '9CDCFE' },
            { token: 'variable.predefined', foreground: '4FC1FF' },
        ],
        colors: {
            'editor.background': '#0A0B14',
            'editor.foreground': '#F8FAFC',
            'editorCursor.foreground': '#D4AF37',
            'editor.lineHighlightBackground': '#1E293B',
            'editorLineNumber.foreground': '#64748B',
            'editorLineNumber.activeForeground': '#D4AF37',
            'editor.selectionBackground': '#264F78',
            'editor.inactiveSelectionBackground': '#3A3D41',
            'editorIndentGuide.background': '#404040',
            'editorIndentGuide.activeBackground': '#707070',
        }
    });
}

// Agent manager with AI integration
class AgentManager {
  constructor() {
    this.agents = [
      // Existing code...
    ]
  }
  // Rest of your AgentManager code...
}

// Load Monaco integration from specified file
document.addEventListener('DOMContentLoaded', function() {
  // Load the Monaco integration file
  const script = document.createElement('script');
  // Use the web-accessible path to the monaco-integration.js file
  script.src = '/dist/node/monaco-integration.js';
  script.onload = function() {
    console.log('Monaco integration loaded successfully');
  };
  script.onerror = function(e) {
    console.error('Failed to load Monaco integration', e);
    // Fallback to CDN as a last resort if the local file fails to load
    const cdnScript = document.createElement('script');
    cdnScript.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs/loader.min.js";
    cdnScript.onload = function() {
      require.config({
        paths: {
          'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.36.1/min/vs'
        }
      });
      require(['vs/editor/editor.main'], function() {
        console.log('Fallback Monaco editor loaded from CDN');
      });
    };
    document.body.appendChild(cdnScript);
  };
  document.body.appendChild(script);
});
