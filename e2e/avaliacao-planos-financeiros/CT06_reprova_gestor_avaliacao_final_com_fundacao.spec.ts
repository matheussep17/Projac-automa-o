import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT06 - reprova no gestor final @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'gestor-final' });
});
