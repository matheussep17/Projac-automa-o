import { test, expect } from '../../fixtures/test';
import path from 'node:path';
import { PlanoTrabalhoPage } from '../../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { PerfilPage } from '../../pages/avaliacao-planos-financeiros/PerfilPage';
import { AvaliacaoPlanoPage } from '../../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { DocumentoContratualPage } from '../../pages/cadastro-planos-financeiros/DocumentoContratualPage';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';

test('CT01 - avalia plano fora de execução com fundação @avaliacao @fora-execucao @fundacao', async ({ page }) => {
  // O fluxo completo inclui cadastro, três avaliações, integração SEI e edição contratual.
  // O trace anterior esgotou os 60 s durante o preenchimento do documento contratual.
  test.setTimeout(120_000);

  const pdf = path.resolve('work/anexo-teste.pdf');
  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: true,
  });
  const plano = new PlanoTrabalhoPage(page);

  const perfil = new PerfilPage(page);
  const avaliacao = new AvaliacaoPlanoPage(page);
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.avaliarUltimo('Plano conferido e aprovado pelo Gestor Financeiro.');
  await perfil.trocarPara('Direção Fundação');
  await avaliacao.abrirPendentes();
  await avaliacao.avaliarUltimo('Documentação conferida e aprovada pela Fundação.', pdf, codigoPlano);
  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  await avaliacao.abrirParaEnvio(codigoPlano);
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
