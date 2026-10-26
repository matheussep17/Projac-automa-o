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
import { sharedData } from '../test-data/shared.data';
import { quadroPessoalData } from '../test-data/quadro-pessoal.data';

test.describe('Plano de Trabalho Financeiro - sem participante', () => {
  test('deve preencher, conferir e salvar o plano sem participante @smoke', async ({ page }) => {
    const pdf = path.resolve('work/anexo-teste.pdf');
    const plano = new PlanoTrabalhoPage(page);
    await plano.iniciarCadastro();

    const projeto = new ProjetoPage(page);
    await projeto.selecionarNaturezaEProjeto();
    await projeto.anexarExtrato(pdf);

    const coordenacaoAprovacao = new CoordenacaoAprovacaoPage(page);
    await coordenacaoAprovacao.preencherViceCoordenador();
    await expect(page.getByLabel(/Matr.*cula SIAPE vice-coordenador\(a\)/i)).toHaveValue(sharedData.matriculaViceCoordenador);
    await coordenacaoAprovacao.preencherAprovacao(pdf);
    await coordenacaoAprovacao.avancar();

    const descricao = new DescricaoPage(page);
    await descricao.preencher({ emExecucao: false, comFundacao: true });
    await descricao.preencherDadosInstitucionais();

    await new CronogramaPage(page).adicionarEtapa();
    await new IndicadorMetaPage(page).adicionarIndicador();
    await new DesembolsoPage(page).adicionarParcela();
    await new PlanoAplicacaoPage(page).preencher(true);
    await new RecursosUfgPage(page).preencher();

    const quadroPessoal = new QuadroPessoalPage(page);
    await quadroPessoal.adicionarBolsista(quadroPessoalData.valorComFundacao, false);
    await quadroPessoal.validarEAvancar(false);

    await new TratamentoTributarioPage(page).preencher();
    await plano.conferirESalvar();
  });
});
