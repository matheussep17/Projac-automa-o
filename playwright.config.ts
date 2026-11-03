import { timeouts } from './config/timeouts';
import { defineConfig, devices } from '@playwright/test';

import { baseURL, storageState } from './config/ambiente';

export default defineConfig({
  timeout: timeouts.padrao,
  expect: { timeout: timeouts.espera },

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
    '**/avaliacao-planos-financeiros/CT01_aprova_plano_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT02_aprova_plano_sem_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT03_devolve_para_ajustes_pelo_tae_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT04_reprova_gestor_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT05_reprova_direcao_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT06_reprova_gestor_avaliacao_final_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT07_reprova_gestor_sem_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT08_edita_pelos_avaliadores_com_aceite_do_tae.spec.ts',
    '**/avaliacao-planos-financeiros/CT09_aprova_sem_documento_com_fundacao.spec.ts',
    '**/avaliacao-planos-financeiros/CT10_aprova_sem_documento_sem_fundacao.spec.ts',
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
