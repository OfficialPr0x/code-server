import fetch from "node-fetch"
import { logger } from "@coder/logger"
import { OpenRouterCompletionRequest, OpenRouterCompletionResponse, AgentResponse } from "./types"
import * as crypto from "crypto"

/**
 * OpenRouter client for connecting to Claude 3.7 Sonnet and other AI models
 */
export class OpenRouterClient {
  private apiKey: string
  private baseUrl: string = "https://openrouter.ai/api/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
    logger.debug("OpenRouter client initialized")
  }

  /**
   * Completion request to OpenRouter
   */
  public async complete(request: OpenRouterCompletionRequest): Promise<AgentResponse> {
    const startTime = Date.now()

    try {
      // Default to Claude 3.7 Sonnet if no model specified
      const model = request.model || "anthropic/claude-3-sonnet-20240229"

      const body = {
        model: model,
        messages: [
          { role: "system", content: request.system || "You are a helpful AI agent." },
          { role: "user", content: request.prompt },
        ],
        max_tokens: request.max_tokens || 4096,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 1,
        frequency_penalty: request.frequency_penalty || 0,
        presence_penalty: request.presence_penalty || 0,
        stop: request.stop,
      }

      logger.debug(`Sending request to OpenRouter: ${model}`, { prompt_length: request.prompt.length })

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://ai-warroom.com",
          "X-Title": "AI War Room",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`OpenRouter API error: ${response.status}`, { error: errorText })
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
      }

      const data = (await response.json()) as OpenRouterCompletionResponse
      const endTime = Date.now()

      return {
        id: crypto.randomUUID(),
        agentId: "system", // This will be updated by the agent manager
        prompt: request.prompt,
        response: data.choices[0].message.content,
        timestamp: new Date(),
        executionTime: endTime - startTime,
        model: data.model,
        tokenUsage: {
          prompt: data.usage.prompt_tokens,
          completion: data.usage.completion_tokens,
          total: data.usage.total_tokens,
        },
      }
    } catch (error) {
      logger.error("OpenRouter completion error", error)
      throw error
    }
  }

  /**
   * Generate embedding vector for a text
   */
  public async embedding(text: string, model: string = "openai/text-embedding-ada-002"): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://ai-warroom.com",
          "X-Title": "AI War Room",
        },
        body: JSON.stringify({
          model: model,
          input: text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        logger.error(`OpenRouter embedding API error: ${response.status}`, { error: errorText })
        throw new Error(`OpenRouter embedding API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      return data.data[0].embedding
    } catch (error) {
      logger.error("OpenRouter embedding error", error)
      throw error
    }
  }
}
