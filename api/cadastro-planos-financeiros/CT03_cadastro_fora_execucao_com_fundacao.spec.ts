import { test, expect } from '../support/fixtures';
import { cadastrar } from '../support/flows';

const cenario = {"ct":"CT03","comFundacao":true,"emExecucao":false} as const;

test(`${cenario.ct} - cadastro ${cenario.emExecucao ? 'em execução' : 'para avaliação'} ${cenario.comFundacao ? 'com' : 'sem'} fundação @api @cadastro`, async ({ api }) => {
    const plano = await cadastrar(api, { ...cenario, comDocumentoContratual: cenario.emExecucao });
    await api.conferirSituacao(plano.id, cenario.emExecucao ? 'Em execução' : 'Pendente');
    expect(plano.descricao.planoEmExecucao).toBe(cenario.emExecucao);
    expect(plano.instrumentosFormalizacao).toHaveLength(cenario.emExecucao ? 1 : 0);
  });
