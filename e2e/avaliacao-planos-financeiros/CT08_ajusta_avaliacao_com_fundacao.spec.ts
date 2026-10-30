import path from 'node:path';
import { expect, test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { CronogramaPage } from '../../pages/cadastro-planos-financeiros/CronogramaPage';
import { DocumentoContratualPage } from '../../pages/cadastro-planos-financeiros/DocumentoContratualPage';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';

test('CT08 - ajusta avaliacao pelo gestor e pela fundacao @avaliacao @ajuste @fundacao', async ({ page }) => {
  test.setTimeout(300_000);
  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true });

  const avaliacao = new AvaliacaoPlanoPage(page);
  const perfil = new PerfilPage(page);
  const cronograma = new CronogramaPage(page);
  const plano = new PlanoTrabalhoPage(page);

  // O Gestor Financeiro solicita uma edicao no plano.
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.abrirParaEdicao();
  await avaliacao.salvarJustificativaEEditarPlano('Ajustar a etapa do cronograma antes da aprovacao.');
  await cronograma.alterarEtapa(undefined, '123');
  await plano.conferirESalvar();

  // O TAE aceita as diferencas e reenvia o plano para a proxima avaliacao.
  await perfil.trocarPara('TAE');
  await avaliacao.aceitarDiferencas(codigoPlano);

  // A Direcao da Fundacao solicita uma nova edicao.
  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.abrirParaEdicao(codigoPlano);
  await avaliacao.salvarJustificativaEEditarPlano('Ajustar novamente a etapa do cronograma pela Fundacao.');
  await cronograma.alterarEtapa(undefined, '1234');
  await plano.conferirESalvar();

  // O TAE aceita a segunda diferenca e o Gestor Financeiro faz a aprovacao final.
  await perfil.trocarPara('TAE');
  await avaliacao.aceitarDiferencas(codigoPlano);
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
