import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT07 - reprova no gestor sem fundacao @avaliacao @reprovacao @sem-fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await reprovarPlanoFinanceiro(page, { comFundacao: false, reprovarEm: 'gestor' });
});
