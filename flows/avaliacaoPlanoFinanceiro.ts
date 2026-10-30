import path from 'node:path';
import { expect, Page } from '@playwright/test';
import { cadastrarPlanoFinanceiro } from './cadastroPlanoFinanceiro';
import { AvaliacaoPlanoPage } from '../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../pages/avaliacao-planos-financeiros/PerfilPage';
import { PlanoTrabalhoPage } from '../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { DocumentoContratualPage } from '../pages/cadastro-planos-financeiros/DocumentoContratualPage';

export type AvaliacaoPlanoConfig = {
  comFundacao: boolean;
  comDocumentoContratual?: boolean;
  codigoPlano?: string;
};

export type ReprovacaoPlanoConfig = {
  comFundacao: boolean;
  reprovarEm: 'gestor' | 'fundacao' | 'gestor-final';
};

export async function reprovarPlanoFinanceiro(page: Page, config: ReprovacaoPlanoConfig): Promise<string> {
  const perfil = new PerfilPage(page);
  const avaliacao = new AvaliacaoPlanoPage(page);
  const plano = new PlanoTrabalhoPage(page);

  await cadastrarPlanoFinanceiro(page, {
    emExecucao: false,
    comFundacao: config.comFundacao,
  });

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  const codigoPlano = await avaliacao.abrirAvaliacaoParaFluxo();

  if (config.reprovarEm === 'gestor') {
    await avaliacao.reprovarAberto('Plano reprovado pelo Gestor Financeiro.');
  } else {
    await avaliacao.aprovarAberto('Plano aprovado pelo Gestor Financeiro.');

    await perfil.trocarPara('Direção Fundação');
    await avaliacao.abrirPendentes();
    await avaliacao.abrirAvaliacaoParaFluxo(codigoPlano);
    if (config.reprovarEm === 'fundacao') {
      await avaliacao.reprovarAberto('Plano reprovado pela Direção da Fundação.');
    } else {
      await avaliacao.aprovarAberto('Plano aprovado pela Direção da Fundação.', path.resolve('work/anexo-teste.pdf'));
      await perfil.trocarPara('Gestor Financeiro');
      await avaliacao.abrirPendentes();
      await avaliacao.abrirAvaliacaoParaFluxo(codigoPlano);
      await avaliacao.reprovarAberto('Plano reprovado pelo Gestor Financeiro na avaliação final.');
    }
  }

  await perfil.trocarPara('Gestor Financeiro');
  await plano.filtrarPlanoReprovado(codigoPlano);
  return codigoPlano;
}

export async function avaliarPlanoFinanceiro(
  page: Page,
  config: AvaliacaoPlanoConfig,
): Promise<{ codigoPlano: string; processoSei: string }> {
  const perfil = new PerfilPage(page);
  const avaliacao = new AvaliacaoPlanoPage(page);
  const plano = new PlanoTrabalhoPage(page);

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  let codigoPlano = config.codigoPlano;
  if (config.comFundacao) {
    codigoPlano = await avaliacao.avaliarUltimo(
      'Plano conferido e aprovado pelo Gestor Financeiro.',
      undefined,
      codigoPlano,
    );
    await perfil.trocarPara('Direção Fundação');
    await avaliacao.abrirPendentes();
    await avaliacao.avaliarUltimo(
      'Documentação conferida e aprovada pela Fundação.',
      path.resolve('work/anexo-teste.pdf'),
      codigoPlano,
    );
    await perfil.trocarPara('Gestor Financeiro');
    await avaliacao.abrirPendentes();
  }

  codigoPlano = await avaliacao.abrirParaEnvio(codigoPlano);
  const processoSei = await avaliacao.enviarParaSei();
  expect(processoSei).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);
  if (config.comDocumentoContratual !== false) {
    await plano.editarPlanoPorCodigo(codigoPlano);
    await new DocumentoContratualPage(page).adicionarAcordoDeParceria(processoSei);
    await plano.conferirESalvar();
    await plano.filtrarPlanoEmExecucao(codigoPlano);
  } else {
    await plano.filtrarPlanoAprovado(codigoPlano);
  }
  return { codigoPlano, processoSei };
}
