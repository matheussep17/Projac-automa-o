import { defineConfig, devices } from '@playwright/test';

const environment = process.env.TEST_ENV ?? 'dev';

const baseURL =
  process.env.TEST_BASE_URL ??
  (environment === 'homolog'
    ? 'https://projetosacademicos-homolog.ufg.br'
    : 'https://projetosacademicos-dev.ufg.br');

export default defineConfig({
  globalSetup: './fixtures/auth.setup.ts',

  testDir: './outputs',

  testMatch: [
    '**/CT02_cadastro_execucao_com_fundacao.spec.ts',
    '**/CT03_cadastro_execucao_sem_fundacao.spec.ts',
    '**/CT04_cadastro_fora_execucao_com_fundacao.spec.ts',
    '**/CT05_cadastro_fora_execucao_sem_fundacao.spec.ts',
    '**/CT06_validacoes_obrigatorias.spec.ts',
  ],

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    storageState: `playwright/.auth/${environment}.json`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});