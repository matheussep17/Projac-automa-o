import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT06 - reprova no gestor final @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.avaliacao);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'gestor-final' });
});
