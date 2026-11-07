import path from 'node:path';
import { expect, Page, test } from '@playwright/test';
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
import { sharedData } from '../test-data';
import { quadroPessoalData } from '../test-data';

export type CadastroPlanoConfig = {
  emExecucao: boolean;
  comFundacao: boolean;
  salvarComoRascunho?: boolean;
  comParticipante?: boolean;
  comDocumentoContratual?: boolean;
};

export function cadastrarPlanoFinanceiro(
  page: Page,
  config: CadastroPlanoConfig & { salvarComoRascunho: true },
): Promise<void>;
export function cadastrarPlanoFinanceiro(
  page: Page,
  config: CadastroPlanoConfig & { salvarComoRascunho?: false },
): Promise<string>;
export async function cadastrarPlanoFinanceiro(page: Page, config: CadastroPlanoConfig): Promise<string | void> {
  const pdf = path.resolve('work/anexo-teste.pdf');
  const plano = new PlanoTrabalhoPage(page);
  await plano.iniciarCadastro();
  const projeto = new ProjetoPage(page);
  await projeto.selecionarNaturezaEProjeto();
  await projeto.anexarExtrato(pdf);
  const coordenacao = new CoordenacaoAprovacaoPage(page);
  await coordenacao.preencherViceCoordenador();
  await expect(page.getByLabel(/Matr.*cula SIAPE vice-coordenador\(a\)/i)).toHaveValue(
    sharedData.matriculaViceCoordenador,
  );
  await coordenacao.preencherAprovacao(pdf);
  await coordenacao.avancar();
  const descricao = new DescricaoPage(page);
  await descricao.preencher({ emExecucao: config.emExecucao, comFundacao: config.comFundacao });
  await descricao.preencherDadosInstitucionais();
  await test.step('Cadastro: cronograma', () => new CronogramaPage(page).adicionarEtapa());
  await test.step('Cadastro: indicadores e metas', () => new IndicadorMetaPage(page).adicionarIndicador());
  await test.step('Cadastro: desembolso', () => new DesembolsoPage(page).adicionarParcela());
  await test.step('Cadastro: plano de aplicacao', () => new PlanoAplicacaoPage(page).preencher(config.comFundacao));
  await new RecursosUfgPage(page).preencher();
  const quadro = new QuadroPessoalPage(page);
  const valor = config.comFundacao ? quadroPessoalData.valorComFundacao : quadroPessoalData.valorSemFundacao;
  await test.step('Cadastro: quadro de pessoal', () => quadro.adicionarBolsista(valor, config.comParticipante ?? true));
  await quadro.validarEAvancar(config.comParticipante ?? true);
  await new TratamentoTributarioPage(page).preencher();
  if (config.comDocumentoContratual) {
    await new DocumentoContratualPage(page).adicionarAcordoDeParceria();
  }
  if (config.salvarComoRascunho) {
    await test.step('Salvar plano como rascunho', () => plano.salvarRascunho());
    return;
  }
  return test.step('Salvar plano e capturar o codigo criado', async () => {
    const [resposta] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname.endsWith('/repercussao-financeira'),
      ),
      plano.conferirESalvar(),
    ]);
    expect(resposta.ok(), 'Falha na resposta do cadastro do plano').toBe(true);
    const registro = await resposta.json();
    const codigo: unknown = registro?.data?.codigo;
    expect(codigo, 'Codigo retornado pelo cadastro').toMatch(/^PTFPQ-\d+$/);
    if (typeof codigo !== 'string') throw new Error('Cadastro nao retornou codigo do plano');
    await test.info().attach('plano-criado', { body: codigo, contentType: 'text/plain' });
    return codigo;
  });
}
