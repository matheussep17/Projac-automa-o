import { test, expect } from '../support/fixtures';
import { cadastrar, aprovar } from '../support/flows';

const [ct, comFundacao] = ["CT02",false] as const;

test(`${ct} - aprova plano ${comFundacao ? 'com' : 'sem'} fundação @api @avaliacao`, async ({ api }) => {
    const plano = await cadastrar(api, { comFundacao });
    await aprovar(api, plano, comFundacao);
    const salvo = await api.conferirSituacao(plano.id, 'Em execução');
    expect(salvo.instrumentosFormalizacao).toHaveLength(1);
  });
