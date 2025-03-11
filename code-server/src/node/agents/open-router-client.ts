/**
 * OpenRouter API Client
 * Manages communication with the OpenRouter API for accessing various AI models
 */

import * as https from "https"
import { OpenRouterCompletionRequest, OpenRouterCompletionResponse } from "./types"

export class OpenRouterClient {
  private apiKey: string
  private apiBase = "api.openrouter.ai"
  private apiPath = "/api/v1/chat/completions"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Make a completion request to the OpenRouter API
   * @param request The completion request parameters
   * @returns Promise with the completion response
   */
  public async createCompletion(request: OpenRouterCompletionRequest): Promise<OpenRouterCompletionResponse> {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(request)

      const options = {
        hostname: this.apiBase,
        path: this.apiPath,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length,
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://code-server-ai-warroom",
          "X-Title": "AI War Room IDE",
        },
      }

      const req = https.request(options, (res) => {
        let responseData = ""

        res.on("data", (chunk) => {
          responseData += chunk
        })

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = JSON.parse(responseData)
              resolve(parsedData)
            } catch (error) {
              reject(new Error(`Failed to parse OpenRouter response: ${error}`))
            }
          } else {
            reject(new Error(`OpenRouter API request failed with status code ${res.statusCode}: ${responseData}`))
          }
        })
      })

      req.on("error", (error) => {
        reject(new Error(`OpenRouter API request error: ${error.message}`))
      })

      req.write(data)
      req.end()
    })
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
  public async completeText(
    model: string,
    prompt: string,
    systemPrompt?: string,
    maxTokens?: number,
    temperature?: number,
  ): Promise<string> {
    try {
      const request: OpenRouterCompletionRequest = {
        model,
        prompt,
        system: systemPrompt,
        max_tokens: maxTokens,
        temperature,
      }

      const response = await this.createCompletion(request)

      if (response.choices && response.choices.length > 0) {
        return response.choices[0].message.content
      }

      throw new Error("No completion choices returned")
    } catch (error) {
      console.error("Error in completeText:", error)
      throw error
    }
  }

  /**
   * Get information about available models
   * @returns Promise with available models information
   */
  public async getModels(): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.apiBase,
        path: "/api/v1/models",
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://code-server-ai-warroom",
          "X-Title": "AI War Room IDE",
        },
      }

      const req = https.request(options, (res) => {
        let responseData = ""

        res.on("data", (chunk) => {
          responseData += chunk
        })

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = JSON.parse(responseData)
              resolve(parsedData)
            } catch (error) {
              reject(new Error(`Failed to parse OpenRouter models response: ${error}`))
            }
          } else {
            reject(
              new Error(`OpenRouter API models request failed with status code ${res.statusCode}: ${responseData}`),
            )
          }
        })
      })

      req.on("error", (error) => {
        reject(new Error(`OpenRouter API models request error: ${error.message}`))
      })

      req.end()
    })
  }
}
