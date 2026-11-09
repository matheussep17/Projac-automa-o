import { randomUUID } from 'node:crypto';
import { expect } from '@playwright/test';
import { ProjacApi, Dto } from './client';
import { ambienteData } from '../../test-data/ambientes';
import {
  sharedData,
  descricaoData,
  cronogramaData,
  desembolsoData,
  indicadorMetaData,
  planoAplicacaoData,
  quadroPessoalData,
  recursosUfgData,
  tratamentoTributarioData,
} from '../../test-data';

export type CadastroApiConfig = {
  comFundacao: boolean;
  emExecucao?: boolean;
  comParticipante?: boolean;
  comDocumentoContratual?: boolean;
};
const comum = '/projac-comum-service';
const integracao = '/projacintegracao-service';
const normalizar = (value: unknown) =>
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
export function escolher(lista: Dto[], campo: string, valor: string): Dto {
  const matches = lista.filter((item) => normalizar(item[campo]) === normalizar(valor));
  expect(matches, `Cadastro de referência ${campo}=${valor}`).toHaveLength(1);
  return matches[0];
}
export function dataIso(data: string): string {
  const [dia, mes, ano] = data.split('/');
  return `${ano}-${mes}-${dia}`;
}
export const reais = (centavos: string) => Number(centavos) / 100;

export async function montarPlano(api: ProjacApi, config: CadastroApiConfig): Promise<Dto> {
  const usuario = await api.get(`${comum}/projeto-academico/usuario-cas`);
  const empregado = async (matricula: string) =>
    escolher(
      await api.list(`${integracao}/empregado/paginado`, {
        search_matricula: matricula,
        search_ativo: true,
      }),
      'matricula',
      matricula,
    );
  const vice = await empregado(sharedData.matriculaViceCoordenador);
  const assistente = escolher(
    await api.list(`${integracao}/vinculo/paginado`, {
      search_matricula: descricaoData.usuarioAssistenteMatricula,
    }),
    'matricula',
    descricaoData.usuarioAssistenteMatricula,
  );
  const natureza = escolher(await api.list(`${comum}/natureza-plano-trabalho`), 'nome', ambienteData.natureza);
  const projeto = escolher(
    await api.list(`${comum}/projetos-sig/paginado`, {
      search_tipo: natureza.codigo,
      search_titulo: ambienteData.projeto,
    }),
    'tituloProjeto',
    ambienteData.projeto,
  );
  // Gestor Financeiro não possui vínculo funcional selecionado no perfil.
  // Nesse caso, o coordenador vem do projeto escolhido, como no cadastro pela interface.
  const matriculaCoordenador = usuario.perfilAtual.vinculoSelecionado?.matricula
    ?? projeto.dadosCoordenador?.matricula;
  expect(matriculaCoordenador, 'Matrícula do coordenador do plano/projeto').toBeTruthy();
  const coordenador = await empregado(String(matriculaCoordenador));
  const funcoes = await api.list(`${comum}/funcao-membro-projeto/paginado`, {
    search_coordenacaoProjetoAcademico: true,
  });
  const categorias = await api.list(`${comum}/categoria-membro-projeto`);
  const membro = (emp: Dto, funcao: string) => ({
    empregado: emp,
    pessoa: emp.pessoa,
    telefone: sharedData.telefoneViceCoordenador,
    categoriaMembroProjeto: escolher(categorias, 'codigo', emp.tipoEmpregado.codigo),
    funcaoMembroProjeto: escolher(funcoes, 'nome', funcao),
    tipo: { descricao: 'Interno', valor: 'INTERNO' },
  });
  const financiador = escolher(
    await api.list(`${comum}/entidade-financiadora/paginado`, { search_ativo: true }),
    'nome',
    'Banco do Brasil',
  );
  const recurso = escolher(await api.list(`${comum}/recurso-financeiro`), 'nome', 'TED');
  const fundacao = config.comFundacao
    ? escolher(
        await api.list(`${comum}/fundacao-apoio/paginado`, { search_nome: ambienteData.fundacao }),
        'nome',
        ambienteData.fundacao,
      )
    : null;
  const subRubrica = escolher(
    await api.list(`${comum}/sub-rubrica/paginado`, { search_ativo: true }),
    'nome',
    'Bolsas',
  );
  const tipoParticipante = escolher(
    await api.list(`${comum}/tipo-participante`, { ativo: true, excluido: false }),
    'nome',
    'Bolsista',
  );
  const instituicao = escolher(await api.list(`${comum}/instituicao/interna`), 'nome', 'Universidade Federal de Goiás');
  const beneficiario = escolher(await api.list(`${comum}/tipo-beneficiario/listagem-ativos`), 'descricao', 'Servidor');
  const tipoTributario = escolher(await api.list(`${comum}/tipo-tratamento-tributario`), 'descricao', 'Bolsa');
  const modalidade = escolher(await api.list(`${comum}/modalidade-bolsa`), 'descricao', 'Ensino - Resolução 83 - 2021');
  const tempo = escolher(await api.list(`${comum}/plano-de-trabalho/unidades-tempo-cronograma`), 'valor', 'TRIMESTRE');
  const etapa = {
    tempId: randomUUID(),
    numero: Number(cronogramaData.etapa),
    descricao: cronogramaData.descricaoEtapa,
    unidadeTempo: tempo,
    quantidade: Number(cronogramaData.quantidade),
    inicio: dataIso(sharedData.inicio),
    fim: dataIso(sharedData.fim),
    ativo: true,
  };
  const valorBolsa = reais(
    config.comFundacao ? quadroPessoalData.valorComFundacao : quadroPessoalData.valorSemFundacao,
  );
  const plano: Dto = {
    isDraft: false,
    ativo: false,
    assistentes: [{ pessoa: coordenador.pessoa }, { pessoa: { id: assistente.idPessoa, nome: assistente.nome } }],
    projeto: {
      titulo: projeto.tituloProjeto,
      natureza,
      subTitulo: '',
      codigoSigaa: projeto.codigo,
      categorias: projeto.categoriaProjeto,
      objetivos: projeto.objetivosProjeto,
      dataInicio: dataIso(projeto.dataInicioVigencia),
      dataFinal: dataIso(projeto.dataFimVigencia),
      inicio: dataIso(projeto.dataInicioVigencia),
      fim: dataIso(projeto.dataFimVigencia),
      unidadesProponentes: [{ unidade: coordenador.unidade }],
      unidadeExecutora: coordenador.unidade,
      unidadeAprovacao: coordenador.unidade,
      participantes: [membro(coordenador, 'Coordenador(a)'), membro(vice, 'Coordenador(a) Adjunto(a)')],
      coordenador: { empregado: coordenador },
      viceCoordenador: { empregado: vice },
    },
    descricao: {
      nome: `API ${randomUUID()} - ${projeto.tituloProjeto}`,
      planoEmExecucao: config.emExecucao ?? false,
      objetivosPlanoFinanceiro: descricaoData.objetivo,
      entidadeFinanciadora: financiador,
      recursoFinanceiro: recurso,
      origemRecursoEnum: { nome: 'Público', codigo: 'PUBLICO' },
      origemRecurso: escolher(recurso.origensRecursos, 'nome', 'Ministérios'),
      geridoPorFundacao: config.comFundacao ? '1' : '0',
      fundacaoApoio: fundacao,
      valorDisponibilizado: reais(sharedData.valorPlano),
      inicioPrevisto: dataIso(sharedData.inicio),
      terminoPrevisto: dataIso(sharedData.fim),
      valorBolsaDefinidoConcedente: true,
      referencialBolsaConcedente: descricaoData.referencialBolsa,
      telefoneInstitucional: descricaoData.telefoneInstitucional,
    },
    etapasCronograma: [etapa],
    metas: [
      { etapaCronograma: etapa, nome: indicadorMetaData.meta, indicadorCumprimentoMetas: indicadorMetaData.indicador },
    ],
    desembolso: {
      detalhamentoReceita: desembolsoData.detalhamentoReceita,
      parcelasDesembolso: [
        {
          numero: Number(desembolsoData.parcela),
          dataInicioExecucao: dataIso(sharedData.inicio),
          valor: reais(desembolsoData.valor),
        },
      ],
    },
    planosAplicacoes: [{ subRubrica, valorSubRubrica: valorBolsa, outraSubRubrica: false, rubricaDePessoal: false }],
    investimento: { naoSeAplica: true, detalhamentos: [], ativo: true },
    recursoUFG: {
      justificativa: recursosUfgData.justificativa,
      itensRecursoUFG: [{ quantidade: Number(recursosUfgData.quantidade), descricao: recursosUfgData.descricao }],
    },
    custoIndiretoProjeto: {
      custoIndiretoUfg: 0,
      custoIndiretoUnidade: 0,
      justificativa: planoAplicacaoData.justificativa,
    },
    repercussaoFinanceiraDAO: config.comFundacao
      ? { valorDaoAplicado: reais(planoAplicacaoData.valorDao), ativo: true, detalhamentos: [] }
      : null,
    quadroPessoal: {
      ativo: true,
      tiposParticipantes: [tipoParticipante],
      beneficiosCeletistas: [],
      participantes: [
        {
          ...(config.comParticipante === false
            ? {}
            : { pessoa: vice.pessoa, matricula: vice.matricula, tipoVinculo: vice.tipoEmpregado.descricao }),
          tipoParticipante,
          instituicaoVinculacao: instituicao,
          tipoBeneficiario: beneficiario,
          quantidadeMeses: Number(quadroPessoalData.quantidadeMeses),
          quantidadeBolsas: Number(quadroPessoalData.quantidadeBolsas),
          valorMensal: valorBolsa,
          valorTotal:
            valorBolsa * Number(quadroPessoalData.quantidadeMeses) * Number(quadroPessoalData.quantidadeBolsas),
          chMensal: Number(quadroPessoalData.cargaHorariaMensal),
        },
      ],
      justificativaBolsistaExternoConvidado: quadroPessoalData.justificativaBolsas,
      selecaoBolsistaExternoConvidado: quadroPessoalData.criteriosSelecao,
    },
    tratamentoTributario: {
      tipoTratamentoTributario: tipoTributario,
      modalidadeBolsa: modalidade,
      justificativa: tratamentoTributarioData.justificativa,
      ativo: true,
    },
    instrumentosFormalizacao: [],
  };
  return plano;
}
