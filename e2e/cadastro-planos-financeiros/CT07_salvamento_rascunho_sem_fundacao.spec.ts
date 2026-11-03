import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT07 - salva rascunho sem fundacao @cadastro @rascunho @sem-fundacao', async ({ page }) => {
  await cadastrarPlanoFinanceiro(page, {
    emExecucao: true,
    comFundacao: false,
    salvarComoRascunho: true,
    comDocumentoContratual: true,
  });
});
