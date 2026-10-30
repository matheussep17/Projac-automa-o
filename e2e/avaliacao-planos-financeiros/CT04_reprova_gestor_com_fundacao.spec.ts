import { expect, test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';

test('CT04 - reprova pelo gestor financeiro com fundacao @avaliacao @reprovacao @fundacao', async ({ page }) => {
  test.setTimeout(120_000);
  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true });

  const avaliacao = new AvaliacaoPlanoPage(page);
  const perfil = new PerfilPage(page);
  const plano = new PlanoTrabalhoPage(page);

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.reprovar('Plano reprovado pelo Gestor Financeiro na primeira avaliacao.');

  await plano.filtrarPlanoReprovado(codigoPlano);
  await expect(page.getByRole('row').filter({ hasText: codigoPlano })).toContainText(/reprovad/i);
});
