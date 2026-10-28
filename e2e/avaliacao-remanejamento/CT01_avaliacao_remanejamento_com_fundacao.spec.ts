import { test, expect } from '../../fixtures/test';
import { prepararPlanoParaRemanejamento, avaliarRemanejamento } from '../../flows/remanejamentoPlanoFinanceiro';
import { RemanejamentoPage } from '../../pages/avaliacao-remanejamento/RemanejamentoPage';

test('CT01 - avalia remanejamento com fundação @remanejamento @avaliacao @fundacao', async ({ page }) => {
  // Inclui cadastro, avaliações iniciais, documento contratual e avaliações do remanejamento pela fundação e pelo gestor.
  test.setTimeout(180_000);
  const config = { comFundacao: true };
  const codigoPlano = await test.step('Preparar plano com fundação aprovado e em execução', async () =>
    prepararPlanoParaRemanejamento(page, config),
  );

  await avaliarRemanejamento(page, codigoPlano, config);

  await test.step('Conferir plano em execução com nova versão', async () => {
    const linha = await new RemanejamentoPage(page).abrirPlanoNaLista(codigoPlano);
    await expect(linha.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
    await expect(linha.getByRole('cell', { name: 'Plano em execução (nova versão)', exact: true })).toBeVisible();
  });
});
