import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT05 - reprova na fundacao @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'fundacao' });
});
