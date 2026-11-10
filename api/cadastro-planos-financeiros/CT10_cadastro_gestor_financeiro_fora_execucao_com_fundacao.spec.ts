import { test, expect } from '../support/fixtures';
import { cadastrar } from '../support/flows';

test('CT10 - cadastra pelo gestor financeiro fora de execução com fundação @api @cadastro @gestor-financeiro @fora-execucao @fundacao', async ({ api }) => {
  const plano = await cadastrar(api, {
    perfilCadastro: 'Gestor Financeiro',
    comFundacao: true,
    emExecucao: false,
    comDocumentoContratual: false,
  });

  await api.conferirSituacao(plano.id, 'Pendente');
  expect(plano.descricao.planoEmExecucao).toBe(false);
  expect(plano.instrumentosFormalizacao).toHaveLength(0);
});
