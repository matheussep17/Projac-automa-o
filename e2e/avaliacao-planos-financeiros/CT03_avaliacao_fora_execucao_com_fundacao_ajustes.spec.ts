import { expect, test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { CronogramaPage } from '../../pages/cadastro-planos-financeiros/CronogramaPage';
import { DocumentoContratualPage } from '../../pages/cadastro-planos-financeiros/DocumentoContratualPage';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';

test('CT03 - avalia plano com ajustes pelo gestor e pela fundacao @avaliacao @pendente @fundacao', async ({ page }) => {
  test.setTimeout(300_000);

  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true });

  const avaliacao = new AvaliacaoPlanoPage(page);
  const perfil = new PerfilPage(page);
  const plano = new PlanoTrabalhoPage(page);
  const cronograma = new CronogramaPage(page);

  // Primeira avaliacao: o Gestor Financeiro solicita ajustes.
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.avaliarPendente(
    'Ajustar a etapa do cronograma antes da aprovacao pelo Gestor Financeiro.',
  );

  // O TAE edita o plano e o envia novamente para avaliacao.
  await perfil.trocarPara('TAE');
  await plano.editarPlanoPorCodigo(codigoPlano);
  await cronograma.alterarEtapa('1', '123');
  await plano.solicitarAlteracao('Etapa alterada para 123 conforme solicitado pelo Gestor Financeiro.');

  // O Gestor Financeiro confere a nova versao e aprova.
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  await avaliacao.aprovar('Ajuste para a etapa 123 conferido e aprovado.', codigoPlano);

  // Segunda avaliacao: a Direcao da Fundacao solicita novos ajustes.
  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.avaliarPendente(
    'Ajustar novamente a etapa do cronograma antes da aprovacao pela Fundacao.',
    codigoPlano,
  );

  // O TAE realiza a segunda edicao e solicita a avaliacao novamente.
  await perfil.trocarPara('TAE');
  await plano.editarPlanoPorCodigo(codigoPlano);
  await cronograma.alterarEtapa(undefined, '1234');
  await plano.solicitarAlteracao('Etapa alterada para 1234 conforme solicitado pela Fundacao.');

  // A Fundacao aprova a versao corrigida.
  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.aprovar('Ajuste para a etapa 1234 conferido e aprovado pela Fundacao.', codigoPlano);

  // Fluxo normal: Gestor Financeiro cria o processo SEI e completa o documento contratual.
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
