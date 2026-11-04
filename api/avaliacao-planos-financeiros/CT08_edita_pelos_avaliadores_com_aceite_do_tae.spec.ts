import { test, expect } from '../support/fixtures';
import { cadastrar, avaliar, ajustarPlano, vincularDocumento } from '../support/flows';
import { avaliacoesPath } from '../support/client';

test('CT08 - avaliadores editam e TAE aceita diferenças @api @avaliacao @ajuste', async ({ api }) => {
  const plano = await cadastrar(api, { comFundacao: true });
  for (const [perfil, etapa] of [['Gestor Financeiro', 123], ['Direção Fundação', 1234]] as const) {
    await avaliar(api, plano.id, perfil, 'Aguardando Ajustes', { planoEditado: true });
    await ajustarPlano(api, plano.id, etapa, true);
    await avaliar(api, plano.id, 'TAE', 'Aprovada', { etapasCronograma: true });
  }
  await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
  const sei = await (await api.ok(await api.request.post(`${avaliacoesPath}/criar-processo-sei/${plano.id}`, { data: {} }))).json();
  await vincularDocumento(api, plano.id, sei.numeroProcesso);
  expect((await api.plano(plano.id)).etapasCronograma[0].numero).toBe(1234);
});
