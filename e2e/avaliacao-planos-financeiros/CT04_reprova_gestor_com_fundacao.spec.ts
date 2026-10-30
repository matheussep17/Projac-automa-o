import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT04 - reprova no gestor com fundacao @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'gestor' });
});
