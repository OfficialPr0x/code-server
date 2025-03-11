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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("../logger");
const crypto = __importStar(require("crypto"));
/**
 * OpenRouter client for connecting to Claude 3.7 Sonnet and other AI models
 */
class OpenRouterClient {
    constructor(apiKey) {
        this.baseUrl = 'https://openrouter.ai/api/v1';
        this.apiKey = apiKey;
        logger_1.logger.debug("OpenRouter client initialized");
    }
    /**
     * Completion request to OpenRouter
     */
    async complete(request) {
        const startTime = Date.now();
        try {
            // Default to Claude 3.7 Sonnet if no model specified
            const model = request.model || 'anthropic/claude-3-sonnet-20240229';
            const body = {
                model: model,
                messages: [
                    { role: "system", content: request.system || "You are a helpful AI agent." },
                    { role: "user", content: request.prompt }
                ],
                max_tokens: request.max_tokens || 4096,
                temperature: request.temperature || 0.7,
                top_p: request.top_p || 1,
                frequency_penalty: request.frequency_penalty || 0,
                presence_penalty: request.presence_penalty || 0,
                stop: request.stop
            };
            logger_1.logger.debug(`Sending request to OpenRouter: ${model}`, { promptLength: request.prompt.length });
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://ai-warroom.com',
                    'X-Title': 'AI War Room'
                },
                body: JSON.stringify(body)
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger_1.logger.error(`OpenRouter API error: ${response.status}`, { errorMessage: errorText });
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            const endTime = Date.now();
            return {
                id: crypto.randomUUID(),
                agentId: 'system', // This will be updated by the agent manager
                prompt: request.prompt,
                response: data.choices[0].message.content,
                timestamp: new Date(),
                executionTime: endTime - startTime,
                model: data.model,
                tokenUsage: {
                    prompt: data.usage.prompt_tokens,
                    completion: data.usage.completion_tokens,
                    total: data.usage.total_tokens
                }
            };
        }
        catch (error) {
            logger_1.logger.error("OpenRouter completion error", error);
            throw error;
        }
    }
    /**
     * Generate embedding vector for a text
     */
    async embedding(text, model = 'openai/text-embedding-ada-002') {
        try {
            const response = await (0, node_fetch_1.default)(`${this.baseUrl}/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://ai-warroom.com',
                    'X-Title': 'AI War Room'
                },
                body: JSON.stringify({
                    model: model,
                    input: text
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger_1.logger.error(`OpenRouter embedding API error: ${response.status}`, { error: errorText });
                throw new Error(`OpenRouter embedding API error: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            return data.data[0].embedding;
        }
        catch (error) {
            logger_1.logger.error("OpenRouter embedding error", error);
            throw error;
        }
    }
}
exports.OpenRouterClient = OpenRouterClient;
