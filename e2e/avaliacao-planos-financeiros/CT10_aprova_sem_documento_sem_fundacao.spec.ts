import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT10 - aprova sem documento sem fundacao @avaliacao @sei @sem-fundacao', async ({ page }) => {
  test.setTimeout(120_000);

  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: false,
  });
  const { processoSei } = await avaliarPlanoFinanceiro(page, {
    comFundacao: false,
    comDocumentoContratual: false,
  });

  expect(processoSei).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);
});
