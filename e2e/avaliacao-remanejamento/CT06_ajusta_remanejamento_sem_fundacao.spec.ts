import { test } from '../../fixtures/test';
import {
  ajustarEAprovarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT06 - ajusta sem fundacao @remanejamento @ajuste @sem-fundacao', async ({ page }) => {
  test.setTimeout(300_000);
  const config = { comFundacao: false };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await ajustarEAprovarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano);
});
