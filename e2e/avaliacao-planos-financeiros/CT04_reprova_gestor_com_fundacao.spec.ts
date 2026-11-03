import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import { reprovarPlanoFinanceiro } from '../../flows/avaliacaoPlanoFinanceiro';

test('CT04 - reprova no gestor com fundacao @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.avaliacao);
  await reprovarPlanoFinanceiro(page, { comFundacao: true, reprovarEm: 'gestor' });
});
