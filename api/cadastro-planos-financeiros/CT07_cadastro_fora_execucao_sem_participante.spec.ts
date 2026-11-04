import { test, expect } from '../support/fixtures';
import { cadastrar } from '../support/flows';

test('CT07 - cadastra sem identificar participante @api @cadastro', async ({ api }) => {
  const plano = await cadastrar(api, { comFundacao: true, comParticipante: false });
  expect(plano.quadroPessoal.participantes).toHaveLength(1);
  expect(plano.quadroPessoal.participantes[0].pessoa?.id ?? null).toBeNull();
});
