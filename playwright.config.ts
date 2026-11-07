import { timeouts } from './config/timeouts';
import { defineConfig, devices } from '@playwright/test';

import { baseURL, storageState } from './config/ambiente';

export default defineConfig({
  timeout: timeouts.padrao,
  expect: { timeout: timeouts.espera },

  globalSetup: './fixtures/auth.setup.ts',

  testDir: './e2e',

  testMatch: '**/*.spec.ts',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    actionTimeout: timeouts.espera,
    navigationTimeout: timeouts.espera,
    ...devices['Desktop Chrome'],
    headless: false,
    baseURL,
    storageState,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
