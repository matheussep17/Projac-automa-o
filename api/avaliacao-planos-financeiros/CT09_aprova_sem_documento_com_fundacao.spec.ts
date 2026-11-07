import { test, expect } from '../support/fixtures';
import { cadastrar, aprovar } from '../support/flows';

const [ct, comFundacao] = ['CT09', true] as const;

test(`${ct} - aprova sem documento ${comFundacao ? 'com' : 'sem'} fundação @api @avaliacao @sei`, async ({ api }) => {
  const plano = await cadastrar(api, { comFundacao });
  await aprovar(api, plano, comFundacao, false);
  const salvo = await api.conferirSituacao(plano.id, 'Aprovada');
  expect(salvo.instrumentosFormalizacao).toHaveLength(0);
});
