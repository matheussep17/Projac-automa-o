import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import {
  avaliarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT08 - aprova dois remanejamentos no mesmo plano sem fundacao @remanejamento @avaliacao @sem-fundacao', async ({
  page,
}) => {
  test.setTimeout(timeouts.ajustes);
  const config = { comFundacao: false };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);

  for (const [atual, nova] of [
    ['1', '12'],
    ['12', '123'],
  ]) {
    await test.step(`Remanejamento da etapa ${atual} para ${nova} no mesmo plano`, async () => {
      await avaliarRemanejamento(page, codigoPlano, config, { atual, nova });
      await validarRemanejamentoConcluido(page, codigoPlano);
    });
  }
});
