import { expect, test } from '@playwright/test';
import { ProjacApi, Dto, Perfil, planosPath, avaliacoesPath } from './client';
import { CadastroApiConfig, montarPlano, dataIso } from './plano.factory';
import { sharedData, documentoContratualData } from '../../test-data';

export async function cadastrar(
  api: ProjacApi,
  config: CadastroApiConfig & { perfilCadastro?: Perfil },
): Promise<Dto> {
  return test.step('API: cadastrar plano completo e consultar persistência', async () => {
    await api.perfil(config.perfilCadastro ?? 'TAE');
    const body = await montarPlano(api, config);
    if (config.comDocumentoContratual) body.instrumentosFormalizacao = [await documento(api, body)];
    const response = await api.ok(
      await api.multipart('post', planosPath, 'repercussao', body, ['extratoProjeto', 'documentoAprovacaoProjeto']),
    );
    const result = await response.json();
    expect(result.asErros).not.toBe(true);
    const plano = result.data;
    expect(plano.codigo).toMatch(/^PTFPQ-\d+$/);
    expect(plano.id).toEqual(expect.any(Number));
    await test.info().attach('plano-api', {
      body: JSON.stringify({ id: plano.id, codigo: plano.codigo }),
      contentType: 'application/json',
    });
    const persisted = await api.plano(plano.id);
    expect(persisted.codigo).toBe(plano.codigo);
    expect(persisted.descricao.valorDisponibilizado).toBe(body.descricao.valorDisponibilizado);
    expect(persisted.etapasCronograma[0].numero).toBe(body.etapasCronograma[0].numero);
    expect(Boolean(persisted.descricao.fundacaoApoio)).toBe(config.comFundacao);
    return persisted;
  });
}

export async function avaliar(
  api: ProjacApi,
  id: number,
  perfil: Perfil,
  situacao: string,
  extras: Dto = {},
): Promise<void> {
  await test.step(`API: ${perfil} avalia como ${situacao}`, async () => {
    await api.perfil(perfil);
    const atual = await api.entity(`${avaliacoesPath}/ultima-avaliacao/${id}`);
    const fields = [
      'id',
      'movimentacao',
      'descricao',
      'etapasCronograma',
      'metas',
      'desembolso',
      'custoIndiretoProjeto',
      'recursoUFG',
      'repercussaoFinanceiraDAO',
      'investimento',
      'valorTotalPlano',
      'planosAplicacoes',
      'quadroPessoal',
      'tratamentoTributario',
      'planoEditado',
      'arquivoPropostaCooperacao',
    ];
    const body = Object.fromEntries(fields.map((field) => [field, atual[field] ?? null]));
    Object.assign(body, { situacao, justificativa: `Avaliação API: ${situacao}`, ...extras });
    if (situacao === 'Aprovada' && atual.versaoRepercussaoFinanceira) {
      const anterior = JSON.parse(atual.versaoRepercussaoFinanceira.versaoAnterior ?? 'null');
      const proposta = JSON.parse(atual.versaoRepercussaoFinanceira.versaoAtual ?? 'null');
      if (JSON.stringify(anterior?.etapasCronograma) !== JSON.stringify(proposta?.etapasCronograma)) {
        body.etapasCronograma = true;
      }
    }
    const files = perfil === 'Direção Fundação' && situacao === 'Aprovada' ? ['file'] : [];
    await api.ok(await api.multipart('post', `${avaliacoesPath}/${id}`, 'avaliacao', body, files));
    const persistida = await api.entity(`${avaliacoesPath}/${atual.id}/detalhes`);
    expect(persistida.situacao, 'Decisão persistida na avaliação').toBe(situacao);
  });
}

export async function aprovar(api: ProjacApi, plano: Dto, comFundacao: boolean, documento = true): Promise<void> {
  if (comFundacao) {
    await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
    await avaliar(api, plano.id, 'Direção Fundação', 'Aprovada');
  }
  await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
  const sei = await criarProcessoSei(api, plano.id);
  expect(sei.numeroProcesso).toMatch(/^\d{5}\.\d{6}\/\d{4}-\d{2}$/);
  await api.conferirSituacao(plano.id, 'Aprovada');
  if (documento) await vincularDocumento(api, plano.id, sei.numeroProcesso);
}

export async function criarProcessoSei(api: ProjacApi, id: number): Promise<Dto> {
  const atual = await api.entity(`${avaliacoesPath}/ultima-avaliacao/${id}`);
  const body = {
    id: atual.id,
    situacao: 'Aprovada',
    justificativa: 'Criação do processo SEI pela API',
  };
  const response = await api.ok(
    await api.multipart('post', `${avaliacoesPath}/${id}?enviarParaSEI=true`, 'avaliacao', body),
  );
  return response.json();
}

export async function vincularDocumento(api: ProjacApi, id: number, processo: string): Promise<void> {
  const plano = await api.plano(id);
  plano.instrumentosFormalizacao = [await documento(api, plano, processo)];
  await api.ok(await api.multipart('put', `${planosPath}/${id}`, 'repercussao', plano));
  await api.conferirSituacao(id, 'Em execução');
}

export async function documento(
  api: ProjacApi,
  plano: Dto,
  processo = documentoContratualData.numeroProcessoSei,
): Promise<Dto> {
  const vice = (
    await api.list('/projacintegracao-service/empregado/paginado', {
      search_matricula: sharedData.matriculaViceCoordenador,
    })
  ).find((item) => item.matricula === sharedData.matriculaViceCoordenador);
  expect(vice, 'Vice-coordenador e fiscal do instrumento').toBeTruthy();
  return {
    tipo: 'Acordo de Parceria',
    numero: documentoContratualData.numeroInstrumento,
    numeroProcessoSEI: processo.replace(/\D/g, ''),
    inicioVigencia: dataIso(sharedData.inicio),
    fimVigencia: dataIso(sharedData.fim),
    possuiContratoAssociado: '0',
    viceCoordenador: vice,
    fiscal: vice,
    valor: plano.descricao.valorDisponibilizado,
    contratos: [],
  };
}

export async function ajustarPlano(api: ProjacApi, id: number, numero: number, avaliadorEditou = false): Promise<void> {
  if (!avaliadorEditou) await api.perfil('TAE');
  const plano = await api.plano(id);
  atualizarEtapa(plano, numero);
  if (avaliadorEditou) {
    await api.ok(await api.multipart('put', `${planosPath}/${id}`, 'repercussao', plano));
  } else {
    await api.ok(
      await api.request.post(`${planosPath}/solicitacao-alteracao`, {
        data: {
          repercussaoFinanceira: plano,
          justificativaCoordenador: `Etapa ajustada para ${numero} via API`,
          situacao: 'Pendente',
        },
      }),
    );
  }
}

export function atualizarEtapa(plano: Dto, numero: number): void {
  const etapa = plano.etapasCronograma[0];
  etapa.numero = numero;
  // A meta referencia a mesma entidade; enviar sua cópia antiga pode desfazer
  // a alteração do número durante a persistência em cascata.
  for (const meta of plano.metas ?? []) {
    if (meta.etapaCronograma?.id === etapa.id) meta.etapaCronograma = { ...etapa };
  }
}
