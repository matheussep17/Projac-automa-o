import { expect, test } from '@playwright/test';
import { ProjacApi, Dto, Perfil, planosPath, solicitacoesPath } from './client';
import { timeouts } from '../../config/timeouts';
import { cadastrar, aprovar, atualizarEtapa } from './flows';

export async function prepararRemanejamento(api: ProjacApi, comFundacao: boolean): Promise<Dto> {
  const plano = await cadastrar(api, { comFundacao });
  await aprovar(api, plano, comFundacao);
  return api.plano(plano.id);
}

export async function solicitarRemanejamento(api: ProjacApi, planoId: number, etapa: number, revisaoId?: number): Promise<void> {
  await test.step(`API: TAE solicita etapa ${etapa}`, async () => {
    await api.perfil('TAE');
    const solicitacao = revisaoId ? await api.entity(`${solicitacoesPath}/${revisaoId}`) : undefined;
    const plano = solicitacao
      ? JSON.parse(solicitacao.versaoRepercussaoFinanceira.versaoAtual)
      : await api.plano(planoId);
    expect(plano.id).toBe(planoId);
    atualizarEtapa(plano, etapa);
    await api.ok(await api.request.post(solicitacoesPath, {
      data: {
        ...(revisaoId ? { id: revisaoId } : {}), repercussaoFinanceira: plano,
        justificativaCoordenador: `Remanejamento API da etapa para ${etapa}`, situacao: 'Pendente',
      },
    }));
  });
}

async function localizarPendente(api: ProjacApi, planoId: number, perfil: Perfil): Promise<Dto> {
  let encontrado: Dto | undefined;
  await expect.poll(async () => {
    for (let page = 0; ; page++) {
      const result = await api.get(`${solicitacoesPath}/paginado`, {
        page, size: 100, search_situacao: 'PENDENTE',
        search_movimentacao: perfil === 'Direção Fundação' ? 'FUNDACAO' : 'PROAD',
      });
      encontrado = result.content.find((item: Dto) => item.versaoRepercussaoFinanceira?.repercussaoFinanceira?.id === planoId);
      if (encontrado || result.last) break;
    }
    return Boolean(encontrado);
  }, { timeout: timeouts.espera, intervals: [250, 500, 1000], message: `Solicitação do plano ${planoId} para ${perfil}` }).toBe(true);
  return encontrado!;
}

export async function avaliarRemanejamentoApi(api: ProjacApi, planoId: number, perfil: Perfil, situacao: string): Promise<Dto> {
  return test.step(`API: ${perfil} decide remanejamento: ${situacao}`, async () => {
    await api.perfil(perfil);
    const pendente = await localizarPendente(api, planoId, perfil);
    const atual = await api.entity(`${solicitacoesPath}/${pendente.id}`);
    const body: Dto = {
      id: atual.id, situacao, justificativaAvaliacao: `Decisão API: ${situacao}`,
      etapasCronograma: situacao === 'Aprovada' ? true : null,
      custoIndiretoProjeto: true, repercussaoFinanceiraDAO: situacao === 'Aprovada' ? true : null,
    };
    await api.ok(await api.multipart('patch', `${solicitacoesPath}/${atual.id}/avaliar`, 'avaliacao', body));
    const salvo = await api.entity(`${solicitacoesPath}/${atual.id}`);
    expect(salvo.situacao).toBe(situacao);
    return salvo;
  });
}

export async function reenviarAjuste(api: ProjacApi, planoId: number, solicitacao: Dto, etapa: number): Promise<void> {
  await api.perfil('TAE');
  const aguardando = await api.list(`${planosPath}/${planoId}/minhas-solicitacoes`, { search_situacao: 'Aguardando Ajustes' });
  expect(aguardando.some(item => item.id === solicitacao.id)).toBe(true);
  await solicitarRemanejamento(api, planoId, etapa, solicitacao.id);
}

export async function concluirRemanejamento(api: ProjacApi, planoId: number, etapa: number): Promise<void> {
  const response = await api.ok(await api.request.post(`${solicitacoesPath}/enviar-plano-financeiro-para-sei/${planoId}`, { data: {} }));
  const retorno = await response.text();
  expect(retorno, 'Processo SEI retornado pelo remanejamento').toMatch(/\d{5}\.\d{6}\/\d{4}-\d{2}/);
  const plano = await api.conferirSituacao(planoId, 'Em execução');
  expect(plano.etapasCronograma[0].numero).toBe(etapa);
}
