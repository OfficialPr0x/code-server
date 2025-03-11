"use strict";
/**
 * OpenRouter API Client
 * Manages communication with the OpenRouter API for accessing various AI models
 */
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
exports.OpenRouterClient = void 0;
const https = __importStar(require("https"));
class OpenRouterClient {
    constructor(apiKey) {
        this.apiBase = 'api.openrouter.ai';
        this.apiPath = '/api/v1/chat/completions';
        this.apiKey = apiKey;
    }
    /**
     * Make a completion request to the OpenRouter API
     * @param request The completion request parameters
     * @returns Promise with the completion response
     */
    async createCompletion(request) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(request);
            const options = {
                hostname: this.apiBase,
                path: this.apiPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://code-server-ai-warroom',
                    'X-Title': 'AI War Room IDE'
                }
            };
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedData = JSON.parse(responseData);
                            resolve(parsedData);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse OpenRouter response: ${error}`));
                        }
                    }
                    else {
                        reject(new Error(`OpenRouter API request failed with status code ${res.statusCode}: ${responseData}`));
                    }
                });
            });
            req.on('error', (error) => {
                reject(new Error(`OpenRouter API request error: ${error.message}`));
            });
            req.write(data);
            req.end();
        });
    }
    /**
     * Helper method to make a simple text completion request
     * @param model The model to use for the completion
     * @param prompt The user's prompt
     * @param systemPrompt The system prompt to set context
     * @param maxTokens Maximum tokens to generate
     * @param temperature The temperature parameter (randomness)
     * @returns The generated text response
     */
    async completeText(model, prompt, systemPrompt, maxTokens, temperature) {
        try {
            const request = {
                model,
                prompt,
                system: systemPrompt,
                max_tokens: maxTokens,
                temperature
            };
            const response = await this.createCompletion(request);
            if (response.choices && response.choices.length > 0) {
                return response.choices[0].message.content;
            }
            throw new Error('No completion choices returned');
        }
        catch (error) {
            console.error('Error in completeText:', error);
            throw error;
        }
    }
    /**
     * Get information about available models
     * @returns Promise with available models information
     */
    async getModels() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.apiBase,
                path: '/api/v1/models',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': 'https://code-server-ai-warroom',
                    'X-Title': 'AI War Room IDE'
                }
            };
            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedData = JSON.parse(responseData);
                            resolve(parsedData);
                        }
                        catch (error) {
                            reject(new Error(`Failed to parse OpenRouter models response: ${error}`));
                        }
                    }
                    else {
                        reject(new Error(`OpenRouter API models request failed with status code ${res.statusCode}: ${responseData}`));
                    }
                });
            });
            req.on('error', (error) => {
                reject(new Error(`OpenRouter API models request error: ${error.message}`));
            });
            req.end();
        });
    }
}
exports.OpenRouterClient = OpenRouterClient;
