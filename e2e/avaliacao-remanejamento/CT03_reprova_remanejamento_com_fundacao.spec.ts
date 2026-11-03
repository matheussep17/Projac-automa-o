import { timeouts } from '../../config/timeouts';
import { test } from '../../fixtures/test';
import {
  prepararPlanoParaRemanejamento,
  reprovarRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT03 - reprova com fundacao @remanejamento @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(timeouts.avaliacao);
  const config = { comFundacao: true };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await reprovarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano, false);
});
