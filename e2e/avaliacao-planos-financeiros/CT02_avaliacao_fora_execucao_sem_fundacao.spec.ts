import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT02 - avalia sem fundacao @avaliacao @sem-fundacao', async ({ page }) => {
  // O cenário inclui cadastro completo, avaliações, integração SEI e edição contratual.
  test.setTimeout(120_000);

  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: false,
  });
  const { codigoPlano } = await avaliarPlanoFinanceiro(page, { comFundacao: false });

  const linhaPlano = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: codigoPlano, exact: true }),
  });
  await expect(linhaPlano.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
});
