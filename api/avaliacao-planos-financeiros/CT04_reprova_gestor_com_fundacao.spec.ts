import { test } from '../support/fixtures';
import { cadastrar, avaliar } from '../support/flows';

const c = {"ct":"CT04","comFundacao":true,"etapa":"gestor"} as const;

test(`${c.ct} - reprova no ${c.etapa} ${c.comFundacao ? 'com' : 'sem'} fundação @api @avaliacao @reprovacao`, async ({ api }) => {
    const plano = await cadastrar(api, { comFundacao: c.comFundacao });
    await avaliar(api, plano.id, 'Gestor Financeiro', 'Reprovada');
    await api.conferirSituacao(plano.id, 'Reprovada');
  });
