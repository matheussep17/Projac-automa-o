import { test } from '../../fixtures/test';
import {
  avaliarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT01 - avalia com fundacao @remanejamento @avaliacao @fundacao', async ({ page }) => {
  test.setTimeout(180_000);
  const config = { comFundacao: true };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await avaliarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano);
});
