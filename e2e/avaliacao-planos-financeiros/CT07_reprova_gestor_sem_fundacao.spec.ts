import { expect, test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';

test('CT07 - reprova pelo gestor financeiro sem fundacao @avaliacao @reprovacao @sem-fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: false });

  const avaliacao = new AvaliacaoPlanoPage(page);
  const perfil = new PerfilPage(page);
  const plano = new PlanoTrabalhoPage(page);

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.reprovar('Plano reprovado pelo Gestor Financeiro sem Fundacao.');

  await plano.filtrarPlanoReprovado(codigoPlano);
  await expect(page.getByRole('row').filter({ hasText: codigoPlano })).toContainText(/reprovad/i);
});
