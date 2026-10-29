import { expect, Page, test } from '@playwright/test';
import { cadastrarPlanoFinanceiro } from './cadastroPlanoFinanceiro';
import { avaliarPlanoFinanceiro } from './avaliacaoPlanoFinanceiro';
import { PerfilPage } from '../pages/avaliacao-planos-financeiros/PerfilPage';
import { CronogramaPage } from '../pages/cadastro-planos-financeiros/CronogramaPage';
import { RemanejamentoPage } from '../pages/avaliacao-remanejamento/RemanejamentoPage';

export type RemanejamentoConfig = { comFundacao: boolean };

export async function prepararPlanoParaRemanejamento(
  page: Page,
  config: RemanejamentoConfig,
): Promise<string> {
  // Captura o plano desta execução, sem selecionar outro registro pela posição na lista.
  const [resposta] = await Promise.all([
    page.waitForResponse((response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname.endsWith('/repercussao-financeira') &&
      response.ok(),
    ),
    cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: config.comFundacao }),
  ]);
  const registro: { data: { codigo: string } } = await resposta.json();
  const codigoPlano = registro.data.codigo;
  expect(codigoPlano).toMatch(/^PTFPQ-\d+$/);
  await avaliarPlanoFinanceiro(page, { comFundacao: config.comFundacao, codigoPlano });
  const linha = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: codigoPlano, exact: true }),
  });
  await expect(linha.getByRole('cell', { name: 'Em execução', exact: true })).toBeVisible();
  return codigoPlano;
}

export async function avaliarRemanejamento(
  page: Page,
  codigoPlano: string,
  config: RemanejamentoConfig,
): Promise<void> {
  const perfil = new PerfilPage(page);
  const remanejamento = new RemanejamentoPage(page);

  await test.step('TAE solicita alteração da etapa 1 para 12', async () => {
    await perfil.trocarPara('TAE');
    await remanejamento.solicitar(codigoPlano);
    await new CronogramaPage(page).alterarEtapa('1', '12');
    await remanejamento.salvarSolicitacao('Alteração da etapa do cronograma de 1 para 12.');
  });

  if (config.comFundacao) {
    await test.step('Fundação aceita as diferenças e aprova o remanejamento', async () => {
      await perfil.trocarPara('Direção Fundação');
      await remanejamento.abrirAvaliacao(codigoPlano);
      await remanejamento.aprovarCronograma('Alteração da etapa do cronograma conferida e aprovada pela Fundação.');
      await remanejamento.salvarAvaliacao();
    });
  }

  await test.step('Gestor Financeiro aprova e envia o remanejamento ao SEI', async () => {
    await perfil.trocarPara('Gestor Financeiro');
    await remanejamento.abrirAvaliacao(codigoPlano);
    await remanejamento.aprovarCronograma('Remanejamento do cronograma aprovado pelo Gestor Financeiro.');
    const processoSei = await remanejamento.enviarParaSei();
    expect(processoSei).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);
  });
}

export async function reprovarRemanejamento(
  page: Page,
  codigoPlano: string,
  config: RemanejamentoConfig,
): Promise<void> {
  const perfil = new PerfilPage(page);
  const remanejamento = new RemanejamentoPage(page);
  const perfilAvaliador: 'Gestor Financeiro' | 'Direção Fundação' =
    config.comFundacao ? 'Direção Fundação' : 'Gestor Financeiro';

  await test.step('TAE solicita alteração da etapa 1 para 12', async () => {
    await perfil.trocarPara('TAE');
    await remanejamento.solicitar(codigoPlano);
    await new CronogramaPage(page).alterarEtapa('1', '12');
    await remanejamento.salvarSolicitacao(
      'Alteração da etapa do cronograma de 1 para 12 para reprovação.',
    );
  });

  await test.step(`Reprovar remanejamento pelo ${perfilAvaliador}`, async () => {
    await perfil.trocarPara(perfilAvaliador);
    await remanejamento.abrirAvaliacao(codigoPlano);
    await remanejamento.reprovarCronograma(
      'Remanejamento reprovado conforme avaliação do plano financeiro.',
    );
    await remanejamento.salvarAvaliacao();
  });

  await test.step('Retornar para o Gestor Financeiro para consultar o plano', async () => {
    await perfil.trocarPara('Gestor Financeiro');
  });
}
