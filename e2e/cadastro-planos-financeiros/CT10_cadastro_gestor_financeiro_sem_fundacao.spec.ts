import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';

test.use({ perfilInicial: 'Gestor Financeiro' });

test('CT10 - cadastra pelo gestor financeiro sem fundacao @cadastro @gestor-financeiro @sem-fundacao', async ({ page }) => {
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
  await cadastrarPlanoFinanceiro(page, {
    emExecucao: true,
    comDocumentoContratual: true,
    usarProjetoDisponivel: true,
    comFundacao: false,
  });
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
});
