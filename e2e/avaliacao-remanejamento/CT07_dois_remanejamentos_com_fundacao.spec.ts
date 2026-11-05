import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import {
  avaliarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT07 - aprova dois remanejamentos no mesmo plano com fundacao @remanejamento @avaliacao @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.ajustes);
  const config = { comFundacao: true };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);

  for (const [atual, nova] of [['1', '12'], ['12', '123']]) {
    await test.step(`Remanejamento da etapa ${atual} para ${nova} no mesmo plano`, async () => {
      await avaliarRemanejamento(page, codigoPlano, config, { atual, nova });
      await validarRemanejamentoConcluido(page, codigoPlano);
    });
  }
});
