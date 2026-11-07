import { timeouts } from '../../config/timeouts';
import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT09 - aprova sem documento com fundacao @avaliacao @sei @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.avaliacao);

  const codigoCriado = await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: true,
  });
  const { processoSei } = await avaliarPlanoFinanceiro(page, {
    codigoPlano: codigoCriado,
    comFundacao: true,
    comDocumentoContratual: false,
  });

  expect(processoSei).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);
});
