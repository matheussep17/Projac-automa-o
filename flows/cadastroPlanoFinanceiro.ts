import path from 'node:path';
import { expect, Page } from '@playwright/test';
import { PlanoTrabalhoPage } from '../pages/cadastro-planos-financeiros/PlanoTrabalhoPage';
import { ProjetoPage } from '../pages/cadastro-planos-financeiros/ProjetoPage';
import { CoordenacaoAprovacaoPage } from '../pages/cadastro-planos-financeiros/CoordenacaoAprovacaoPage';
import { DescricaoPage } from '../pages/cadastro-planos-financeiros/DescricaoPage';
import { CronogramaPage } from '../pages/cadastro-planos-financeiros/CronogramaPage';
import { IndicadorMetaPage } from '../pages/cadastro-planos-financeiros/IndicadorMetaPage';
import { DesembolsoPage } from '../pages/cadastro-planos-financeiros/DesembolsoPage';
import { PlanoAplicacaoPage } from '../pages/cadastro-planos-financeiros/PlanoAplicacaoPage';
import { RecursosUfgPage } from '../pages/cadastro-planos-financeiros/RecursosUfgPage';
import { QuadroPessoalPage } from '../pages/cadastro-planos-financeiros/QuadroPessoalPage';
import { TratamentoTributarioPage } from '../pages/cadastro-planos-financeiros/TratamentoTributarioPage';
import { DocumentoContratualPage } from '../pages/cadastro-planos-financeiros/DocumentoContratualPage';
import { sharedData } from '../test-data/shared.data';
import { quadroPessoalData } from '../test-data/quadro-pessoal.data';

export type CadastroPlanoConfig = {
  emExecucao: boolean;
  comFundacao: boolean;
  salvarComoRascunho?: boolean;
  comParticipante?: boolean;
  comDocumentoContratual?: boolean;
};

export async function cadastrarPlanoFinanceiro(page: Page, config: CadastroPlanoConfig): Promise<void> {
  const pdf = path.resolve('work/anexo-teste.pdf');
  const plano = new PlanoTrabalhoPage(page);
  await plano.iniciarCadastro();
  const projeto = new ProjetoPage(page);
  await projeto.selecionarNaturezaEProjeto();
  await projeto.anexarExtrato(pdf);
  const coordenacao = new CoordenacaoAprovacaoPage(page);
  await coordenacao.preencherViceCoordenador();
  await expect(page.getByLabel(/Matr.*cula SIAPE vice-coordenador\(a\)/i)).toHaveValue(sharedData.matriculaViceCoordenador);
  await coordenacao.preencherAprovacao(pdf);
  await coordenacao.avancar();
  const descricao = new DescricaoPage(page);
  await descricao.preencher({ emExecucao: config.emExecucao, comFundacao: config.comFundacao });
  await descricao.preencherDadosInstitucionais();
  await new CronogramaPage(page).adicionarEtapa();
  await new IndicadorMetaPage(page).adicionarIndicador();
  await new DesembolsoPage(page).adicionarParcela();
  await new PlanoAplicacaoPage(page).preencher(config.comFundacao);
  await new RecursosUfgPage(page).preencher();
  const quadro = new QuadroPessoalPage(page);
  const valor = config.comFundacao ? quadroPessoalData.valorComFundacao : quadroPessoalData.valorSemFundacao;
  await quadro.adicionarBolsista(valor, config.comParticipante ?? true);
  await quadro.validarEAvancar(config.comParticipante ?? true);
  await new TratamentoTributarioPage(page).preencher();
  if (config.comDocumentoContratual) {
    await new DocumentoContratualPage(page).adicionarAcordoDeParceria();
  }
  if (config.salvarComoRascunho) await plano.salvarRascunho();
  else await plano.conferirESalvar();
}
