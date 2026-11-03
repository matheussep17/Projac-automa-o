import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import {
  avaliarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT02 - avalia sem fundacao @remanejamento @avaliacao @sem-fundacao', async ({ page }) => {
  test.setTimeout(timeouts.remanejamento);
  const config = { comFundacao: false };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await avaliarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano);
});
