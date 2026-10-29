import { test, expect } from '../../fixtures/test';
import { prepararPlanoParaRemanejamento, reprovarRemanejamento } from '../../flows/remanejamentoPlanoFinanceiro';
import { RemanejamentoPage } from '../../pages/avaliacao-remanejamento/RemanejamentoPage';

test('CT03 - reprova remanejamento com fundação e mantém plano em execução @remanejamento @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  const config = { comFundacao: true };
  const codigoPlano = await prepararPlanoParaRemanejamento(page, config);
  await reprovarRemanejamento(page, codigoPlano, config);

  const linha = await new RemanejamentoPage(page).abrirPlanoNaLista(codigoPlano);
  await expect(linha.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
});
