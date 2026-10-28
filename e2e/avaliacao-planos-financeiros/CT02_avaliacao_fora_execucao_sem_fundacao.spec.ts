import { test, expect } from '../../fixtures/test';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { DocumentoContratualPage } from '../../pages/cadastro-planos-financeiros/DocumentoContratualPage';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';

test('CT02 - avalia plano fora de execução sem fundação @avaliacao @fora-execucao @sem-fundacao', async ({ page }) => {
  // O cenário inclui cadastro completo, integração SEI e edição contratual.
  test.setTimeout(120_000);

  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: false,
  });

  const plano = new PlanoTrabalhoPage(page);
  const avaliacao = new AvaliacaoPlanoPage(page);
  await new PerfilPage(page).trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.abrirParaEnvio();
  const processoSei = await avaliacao.enviarParaSei();
  expect(processoSei).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);

  await plano.editarPlanoPorCodigo(codigoPlano);
  await new DocumentoContratualPage(page).adicionarAcordoDeParceria(processoSei);
  await plano.conferirESalvar();
  await plano.filtrarPlanoEmExecucao(codigoPlano);
  const linhaPlano = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: codigoPlano, exact: true }),
  });
  await expect(linhaPlano.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
});
