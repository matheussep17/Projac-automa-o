import { defineConfig, devices } from '@playwright/test';

const environment = process.env.TEST_ENV ?? 'dev';

const baseURL =
  process.env.TEST_BASE_URL ??
  (environment === 'homolog' ? 'https://projetosacademicos-homolog.ufg.br' : 'https://projetosacademicos-dev.ufg.br');

export default defineConfig({
  timeout: 60_000,

  globalSetup: './fixtures/auth.setup.ts',

  testDir: './e2e',

  testMatch: [
    '**/cadastro-planos-financeiros/CT01_cadastro_execucao_com_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT02_cadastro_execucao_sem_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT03_cadastro_fora_execucao_com_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT04_cadastro_fora_execucao_sem_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT05_validacoes_obrigatorias.spec.ts',
    '**/cadastro-planos-financeiros/CT06_salvamento_rascunho_com_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT07_salvamento_rascunho_sem_fundacao.spec.ts',
    '**/cadastro-planos-financeiros/CT08_cadastro_fora_execucao_sem_participante.spec.ts',
    '**/avaliacao-planos-financeiros/CT01_avaliacao_fora_execucao_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT02_avaliacao_fora_execucao_sem_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT03_avaliacao_fora_execucao_com_fundacao_ajustes.spec.ts',
    '**/avaliacao-planos-financeiros/CT04_reprova_gestor_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT05_reprova_direcao_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT06_reprova_gestor_avaliacao_final_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT07_reprova_gestor_sem_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT01_avaliacao_remanejamento_com_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT02_avaliacao_remanejamento_sem_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT03_reprova_remanejamento_com_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT04_reprova_remanejamento_sem_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT05_ajusta_remanejamento_com_fundacao.spec.ts',
    '**/avaliacao-remanejamento/CT06_ajusta_remanejamento_sem_fundacao.spec.ts',
  ],

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [['list'], ['html', { open: 'never' }]],

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
