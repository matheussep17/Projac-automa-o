import { defineConfig } from '@playwright/test';
import uiConfig from './playwright.config';
import { timeouts } from './config/timeouts';
import { apiStorageState } from './api/support/auth-state';

export default defineConfig(uiConfig, {
  testDir: './api',
  globalSetup: './api/support/auth.setup.ts',
  testMatch: '**/*.spec.ts',
  timeout: timeouts.avaliacao,
  workers: 1,
  fullyParallel: false,
  retries: 0,
  outputDir: 'test-results/api',
  use: { ...uiConfig.use, storageState: apiStorageState },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report/api', open: 'never' }],
    ['json', { outputFile: 'test-results/api-results.json' }],
  ],
});
