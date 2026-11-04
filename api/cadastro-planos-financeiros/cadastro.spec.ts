import { test, expect } from '../support/fixtures';
import { cadastrar } from '../support/flows';
import { montarPlano } from '../support/plano.factory';
import { planosPath } from '../support/client';

for (const cenario of [
  { ct: 'CT01', comFundacao: true, emExecucao: true },
  { ct: 'CT02', comFundacao: false, emExecucao: true },
  { ct: 'CT03', comFundacao: true, emExecucao: false },
  { ct: 'CT04', comFundacao: false, emExecucao: false },
]) {
  test(`${cenario.ct} - cadastro ${cenario.emExecucao ? 'em execução' : 'para avaliação'} ${cenario.comFundacao ? 'com' : 'sem'} fundação @api @cadastro`, async ({ api }) => {
    const plano = await cadastrar(api, { ...cenario, comDocumentoContratual: cenario.emExecucao });
    await api.conferirSituacao(plano.id, cenario.emExecucao ? 'Em execução' : 'Pendente');
    expect(plano.descricao.planoEmExecucao).toBe(cenario.emExecucao);
    expect(plano.instrumentosFormalizacao).toHaveLength(cenario.emExecucao ? 1 : 0);
  });
}

test('CT05 - rejeita cadastro vazio na API @api @cadastro @negativo', async ({ api }) => {
  const response = await api.multipart('post', planosPath, 'repercussao', {});
  expect(response.status(), 'Validação deve responder 4xx, sem erro interno').toBeGreaterThanOrEqual(400);
  expect(response.status()).toBeLessThan(500);
});

for (const [ct, comFundacao] of [['CT06', true], ['CT07', false]] as const) {
  test(`${ct} - salva e consulta rascunho ${comFundacao ? 'com' : 'sem'} fundação @api @cadastro @rascunho`, async ({ api }) => {
    const body = await montarPlano(api, { comFundacao });
    body.isDraft = true;
    const response = await api.ok(await api.multipart('post', `${planosPath}/draft`, 'entity', body, ['extratoProjeto', 'documentoAprovacaoProjeto']));
    const result = await response.json();
    const draft = result.data ?? result;
    const id = draft.draftId ?? draft.id;
    expect(id).toBeTruthy();
    const persisted = await api.plano(id);
    expect(persisted.isDraft).toBe(true);
    expect(persisted.descricao.valorDisponibilizado).toBe(body.descricao.valorDisponibilizado);
  });
}

test('CT08 - cadastra sem identificar participante @api @cadastro', async ({ api }) => {
  const plano = await cadastrar(api, { comFundacao: true, comParticipante: false });
  expect(plano.quadroPessoal.participantes).toHaveLength(1);
  expect(plano.quadroPessoal.participantes[0].pessoa?.id ?? null).toBeNull();
});
