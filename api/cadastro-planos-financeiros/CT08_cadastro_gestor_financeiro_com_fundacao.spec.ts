import { test, expect } from '../support/fixtures';
import { cadastrar } from '../support/flows';

test('CT08 - cadastra pelo gestor financeiro com fundação @api @cadastro @gestor-financeiro', async ({ api }) => {
  const plano = await cadastrar(api, {
    perfilCadastro: 'Gestor Financeiro',
    comFundacao: true,
    emExecucao: true,
    comDocumentoContratual: true,
  });

  await api.conferirSituacao(plano.id, 'Em execução');
  expect(plano.descricao.planoEmExecucao).toBe(true);
  expect(plano.instrumentosFormalizacao).toHaveLength(1);
});
