import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';

test.use({ perfilInicial: 'Gestor Financeiro' });

test('CT11 - cadastra pelo gestor financeiro fora de execucao com fundacao @cadastro @gestor-financeiro @fora-execucao @fundacao', async ({ page }) => {
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comDocumentoContratual: false,
    usarProjetoDisponivel: true,
    comFundacao: true,
  });
  await new PerfilPage(page).confirmarAtual('Gestor Financeiro');
});
