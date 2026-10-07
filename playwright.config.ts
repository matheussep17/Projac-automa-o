import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './outputs',
  testMatch: [
    '**/CT02_cadastro_execucao_com_fundacao.spec.ts',
    '**/CT03_cadastro_execucao_sem_fundacao.spec.ts',
    '**/CT04_cadastro_fora_execucao_com_fundacao.spec.ts',
    '**/CT05_cadastro_fora_execucao_sem_fundacao.spec.ts',
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://projetosacademicos-dev.ufg.br',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
});
