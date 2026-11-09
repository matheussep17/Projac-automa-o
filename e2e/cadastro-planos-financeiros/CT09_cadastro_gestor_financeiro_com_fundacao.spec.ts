import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';

test.use({ perfilInicial: 'Gestor Financeiro' });

test('CT09 - cadastra pelo gestor financeiro com fundacao @cadastro @gestor-financeiro @fundacao', async ({ page }) => {
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
  await cadastrarPlanoFinanceiro(page, {
    emExecucao: true,
    comDocumentoContratual: true,
    usarProjetoDisponivel: true,
    comFundacao: true,
  });
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
});
