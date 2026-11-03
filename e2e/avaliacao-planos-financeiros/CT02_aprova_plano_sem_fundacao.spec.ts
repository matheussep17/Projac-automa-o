import { timeouts } from '../../config/timeouts';
import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT02 - aprova plano sem fundacao @avaliacao @sem-fundacao', async ({ page }) => {
  // O cenário inclui cadastro completo, avaliações, integração SEI e edição contratual.
  test.setTimeout(timeouts.avaliacao);

  const codigoCriado = await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: false,
  });
  const { codigoPlano } = await avaliarPlanoFinanceiro(page, { codigoPlano: codigoCriado, comFundacao: false });

  const linhaPlano = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: codigoPlano, exact: true }),
  });
  await expect(linhaPlano.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
});
