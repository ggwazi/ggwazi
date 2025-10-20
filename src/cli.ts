#!/usr/bin/env node
import { McpServer, createOfflineFetchTool } from './mcp/server.js';

async function run(): Promise<void> {
  const [,, cmd, url, cacheKey] = process.argv;
  const server = new McpServer();
  server.registerTool(createOfflineFetchTool());
  if (cmd === 'prefetch' && url && cacheKey) {
    const res = await server.runTool('offlineFetch', { url, cacheKey });
    console.log(JSON.stringify(res));
    return;
  }
  console.error('Usage: cli prefetch <url> <cacheKey>');
  process.exit(1);
}

run();
