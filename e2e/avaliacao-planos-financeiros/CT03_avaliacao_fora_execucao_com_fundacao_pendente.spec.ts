import { test, expect } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { CronogramaPage } from '../../pages/cadastro-planos-financeiros/CronogramaPage';
import { DocumentoContratualPage } from '../../pages/cadastro-planos-financeiros/DocumentoContratualPage';

test('CT03 - fluxo pendente fora de execução com fundação @avaliacao @pendente @fundacao', async ({ page }) => {
  // O fluxo completo troca de perfil várias vezes e inclui duas avaliações,
  // duas edições do cronograma e geração do processo SEI.
  test.setTimeout(300_000);
  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true });

  const avaliacao = new AvaliacaoPlanoPage(page);
  const perfil = new PerfilPage(page);
  const plano = new PlanoTrabalhoPage(page);
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.avaliarPendente('Ajustar a etapa do cronograma antes da aprovação.');

  await perfil.trocarPara('TAE');
  await plano.editarPlanoPorCodigo(codigoPlano);
  await new CronogramaPage(page).alterarEtapa('1', '123');
  await plano.solicitarAlteracao('Etapa alterada para 123 conforme solicitado pelo Gestor Financeiro.');

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  await avaliacao.aprovar('Alteração para a etapa 123 conferida e aprovada.', codigoPlano);

  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.avaliarPendente('Ajustar novamente a etapa do cronograma para 1234.', codigoPlano);

  await perfil.trocarPara('TAE');
  await plano.editarPlanoPorCodigo(codigoPlano);
  await new CronogramaPage(page).alterarEtapa('123', '1234');
  await plano.solicitarAlteracao('Etapa alterada para 1234 conforme solicitado pela Fundação.');

  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.aprovar('Alteração para a etapa 1234 conferida e aprovada.', codigoPlano);

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  await avaliacao.abrirParaEnvio(codigoPlano);
  const processoSei = await avaliacao.enviarParaSei();
  await plano.editarPlanoPorCodigo(codigoPlano);
  await new DocumentoContratualPage(page).adicionarAcordoDeParceria(processoSei);
  await plano.conferirESalvar();
  await plano.filtrarPlanoEmExecucao(codigoPlano);
  await expect(page.getByRole('row').filter({ hasText: codigoPlano })).toContainText(/em execu/i);
});
