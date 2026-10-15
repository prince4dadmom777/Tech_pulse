import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './logging/logger.js';

const app = createApp();

app.listen(config.port, () => {
  logger.info(`========================================================`);
  logger.info(` FlowPilot AI Server running on http://localhost:${config.port}`);
  logger.info(` API base URL: ${config.apiBaseUrl}`);
  logger.info(` AI Status: ${config.gemini.isConfigured ? 'Live Gemini Online' : 'High-Fidelity Demo Simulation'}`);
  logger.info(`========================================================`);
});
