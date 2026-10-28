import path from 'node:path';
import { expect, Page } from '@playwright/test';
import { AvaliacaoPlanoPage } from '../pages/avaliacao-planos-financeiros/AvaliacaoPlanoPage';
import { PerfilPage } from '../pages/avaliacao-planos-financeiros/PerfilPage';
import { PlanoTrabalhoPage } from '../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { DocumentoContratualPage } from '../pages/cadastro-planos-financeiros/DocumentoContratualPage';

export type AvaliacaoPlanoConfig = {
  comFundacao: boolean;
};

export async function avaliarPlanoFinanceiro(
  page: Page,
  config: AvaliacaoPlanoConfig,
): Promise<{ codigoPlano: string; processoSei: string }> {
  const perfil = new PerfilPage(page);
  const avaliacao = new AvaliacaoPlanoPage(page);
  const plano = new PlanoTrabalhoPage(page);

  await perfil.trocarPara('Gestor Financeiro');
  await avaliacao.abrirPendentes();
  let codigoPlano: string | undefined;
  if (config.comFundacao) {
    codigoPlano = await avaliacao.avaliarUltimo('Plano conferido e aprovado pelo Gestor Financeiro.');
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
  await plano.editarPlanoPorCodigo(codigoPlano);
  await new DocumentoContratualPage(page).adicionarAcordoDeParceria(processoSei);
  await plano.conferirESalvar();
  await plano.filtrarPlanoEmExecucao(codigoPlano);
  return { codigoPlano, processoSei };
}
