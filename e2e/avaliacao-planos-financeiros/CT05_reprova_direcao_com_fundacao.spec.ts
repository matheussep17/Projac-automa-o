import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT05 - reprova na fundacao @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.avaliacao);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'fundacao' });
});
