import { test, expect } from '../fixtures/test';
import path from 'node:path';
import { PlanoTrabalhoPage } from '../pages/PlanoTrabalhoPage';
import { ProjetoPage } from '../pages/ProjetoPage';
import { CoordenacaoAprovacaoPage } from '../pages/CoordenacaoAprovacaoPage';
import { DescricaoPage } from '../pages/DescricaoPage';
import { PlanoAplicacaoPage } from '../pages/PlanoAplicacaoPage';
import { QuadroPessoalPage } from '../pages/QuadroPessoalPage';
import { TratamentoTributarioPage } from '../pages/TratamentoTributarioPage';
import { CronogramaPage } from '../pages/CronogramaPage';
import { IndicadorMetaPage } from '../pages/IndicadorMetaPage';
import { DesembolsoPage } from '../pages/DesembolsoPage';
import { RecursosUfgPage } from '../pages/RecursosUfgPage';

test.describe('Plano de Trabalho Financeiro - sem fundação @fora-execucao @sem-fundacao', () => {
  test('deve preencher, conferir e salvar o plano sem fundação @smoke', async ({ page }) => {
    const pdf = path.resolve('work/anexo-teste.pdf');

    const plano = new PlanoTrabalhoPage(page);
    await plano.iniciarCadastro();

    // Projeto / aprovação
    const projeto = new ProjetoPage(page);
    await projeto.selecionarNaturezaEProjeto();

    // Upload do extrato do projeto na aba Dados do Projeto.
    await projeto.anexarExtrato(pdf);

    // Dados do(a) Coordenador(a)
    const coordenacaoAprovacao = new CoordenacaoAprovacaoPage(page);
    await coordenacaoAprovacao.preencherViceCoordenador();
    await expect(page.getByLabel('Matrícula SIAPE vice-coordenador(a)')).toHaveValue('1866324');
    await coordenacaoAprovacao.preencherAprovacao(pdf);
    await coordenacaoAprovacao.avancar();

    const descricao = new DescricaoPage(page);
    await descricao.preencher({ emExecucao: false, comFundacao: false });
    await descricao.preencherDadosInstitucionais();

    // Cronograma
    const cronograma = new CronogramaPage(page);
    await cronograma.adicionarEtapa();

    // Indicador e meta
    const indicadorMeta = new IndicadorMetaPage(page);
    await indicadorMeta.adicionarIndicador();

    // Desembolso
    const desembolso = new DesembolsoPage(page);
    await desembolso.adicionarParcela();

    // Sem fundação: DAO fica bloqueado e todo o recurso vai para Bolsas.
    const planoAplicacao = new PlanoAplicacaoPage(page);
    await planoAplicacao.preencher(false);

    // Recursos da UFG
    const recursosUfg = new RecursosUfgPage(page);
    await recursosUfg.preencher();

    // Quadro de pessoal
    const quadroPessoal = new QuadroPessoalPage(page);
    await quadroPessoal.adicionarBolsista('1000000');
    await quadroPessoal.validarEAvancar();

    // Tratamento tributário
    const tratamentoTributario = new TratamentoTributarioPage(page);
    await tratamentoTributario.preencher();

    // Conferência e salvamento final.
    await plano.conferirESalvar();
  });
});
