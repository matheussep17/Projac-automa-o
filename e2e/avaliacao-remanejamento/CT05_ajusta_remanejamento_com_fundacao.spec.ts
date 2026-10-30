import { test, expect } from '../../fixtures/test';
import { prepararPlanoParaRemanejamento, ajustarEAprovarRemanejamento } from '../../flows/remanejamentoPlanoFinanceiro';
import { RemanejamentoPage } from '../../pages/avaliacao-remanejamento/RemanejamentoPage';

test('CT05 - ajusta e aprova remanejamento com fundação @remanejamento @pendente @comFundacao', async ({ page }) => {
  // Inclui cadastro, aprovação inicial e dois ciclos de ajustes do remanejamento.
  test.setTimeout(120_000);
  const config = { comFundacao: true };
  const codigoPlano = await test.step('Preparar plano com fundação aprovado e em execução', async () =>
    prepararPlanoParaRemanejamento(page, config),
  );

  await ajustarEAprovarRemanejamento(page, codigoPlano, config);

  await test.step('Conferir plano em execução com nova versão após os ajustes', async () => {
    const linha = await new RemanejamentoPage(page).abrirPlanoNaLista(codigoPlano);
    await expect(linha.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
    await expect(linha.getByRole('cell', { name: 'Plano em execução (nova versão)', exact: true })).toBeVisible();
  });
});
