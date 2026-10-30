import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT01 - avalia com fundacao @avaliacao @fundacao', async ({ page }) => {
  // O cenário inclui cadastro completo, avaliações, integração SEI e edição contratual.
  test.setTimeout(120_000);

  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: true,
  });
  const { codigoPlano } = await avaliarPlanoFinanceiro(page, { comFundacao: true });

  const linhaPlano = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: codigoPlano, exact: true }),
  });
  await expect(linhaPlano.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
});
