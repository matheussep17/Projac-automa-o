import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT06 - salva rascunho com fundacao @cadastro @rascunho @fundacao', async ({ page }) =>
  cadastrarPlanoFinanceiro(page, {
    emExecucao: true,
    comFundacao: true,
    salvarComoRascunho: true,
    comDocumentoContratual: true,
  }));
