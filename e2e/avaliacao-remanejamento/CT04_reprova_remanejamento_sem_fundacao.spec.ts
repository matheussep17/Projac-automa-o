import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import {
  prepararPlanoParaRemanejamento,
  reprovarRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT04 - reprova sem fundacao @remanejamento @reprovacao @sem-fundacao', async ({ page }) => {
  test.setTimeout(timeouts.curto);
  const config = { comFundacao: false };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await reprovarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano, false);
});
