import { test } from '../../fixtures/test';
import {
  ajustarEAprovarRemanejamento,
  prepararPlanoParaRemanejamento,
  validarRemanejamentoConcluido,
} from '../../flows/remanejamentoPlanoFinanceiro';

test('CT05 - ajusta com fundacao @remanejamento @ajuste @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  const config = { comFundacao: true };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await ajustarEAprovarRemanejamento(page, codigoPlano, config);
  await validarRemanejamentoConcluido(page, codigoPlano);
});
