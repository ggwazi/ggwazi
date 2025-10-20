// Minimal stub to align with Zen MCP style without importing it directly.
// You can replace this with actual zen-mcp-server usage later.
import { logger } from '../utils/logger.js';

export interface ToolInputSchema {
  name: string;
  description?: string;
}

export interface McpTool {
  name: string;
  run: (input: unknown) => Promise<unknown> | unknown;
}

export class McpServer {
  private readonly tools: Map<string, McpTool> = new Map();

  registerTool(tool: McpTool): void {
    this.tools.set(tool.name, tool);
    logger.debug({ tool: tool.name }, 'Registered MCP tool');
  }

  async runTool(name: string, input: unknown): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.run(input);
  }
}

export function createEchoTool(name = 'echo'): McpTool {
  return {
    name,
    async run(input: unknown) {
      return { input };
    },
  };
}

export function createOfflineFetchTool(name = 'offlineFetch'): McpTool {
  return {
    name,
    async run(input: unknown) {
      if (typeof input !== 'object' || input === null) {
        throw new Error('Input must be an object');
      }
      const { url, cacheKey } = input as { url?: string; cacheKey?: string };
      if (!url || !cacheKey) {
        throw new Error('Missing url or cacheKey');
      }
      const { getWithOfflineCache } = await import('../utils/http.js');
      const text = await getWithOfflineCache(url, cacheKey);
      return { text };
    },
  };
}
