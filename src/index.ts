import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { McpServer, createEchoTool, createOfflineFetchTool } from './mcp/server.js';

async function main(): Promise<void> {
  const server = new McpServer();
  logger.info({ env: env.NODE_ENV }, 'Dev template booted');
  // Register tools or start your app here
  server.registerTool(createEchoTool());
  server.registerTool(createOfflineFetchTool());
  if (env.NODE_ENV === 'development') {
    logger.info('Running in development mode');
  }
}

main().catch((err) => {
  logger.error({ err }, 'Fatal error');
  process.exit(1);
});
