import { defineConfig, devices } from '@playwright/test';

const environment = process.env.TEST_ENV ?? 'dev';

const baseURL =
  process.env.TEST_BASE_URL ??
  (environment === 'homolog'
    ? 'https://projetosacademicos-homolog.ufg.br'
    : 'https://projetosacademicos-dev.ufg.br');

export default defineConfig({
  timeout: 60_000,

  globalSetup: './fixtures/auth.setup.ts',

  testDir: './e2e',

  testMatch: [
    '**/CT01_cadastro_execucao_com_fundacao.spec.ts',
    '**/CT02_cadastro_execucao_sem_fundacao.spec.ts',
    '**/CT03_cadastro_fora_execucao_com_fundacao.spec.ts',
    '**/CT04_cadastro_fora_execucao_sem_fundacao.spec.ts',
    '**/CT05_validacoes_obrigatorias.spec.ts',
    '**/CT06_salvamento_rascunho_com_fundacao.spec.ts',
    '**/CT07_salvamento_rascunho_sem_fundacao.spec.ts',
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
    headless: false,
    baseURL,
    storageState: `playwright/.auth/${environment}.json`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
