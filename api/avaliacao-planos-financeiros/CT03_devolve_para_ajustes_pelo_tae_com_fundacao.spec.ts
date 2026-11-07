import { test, expect } from '../support/fixtures';
import { cadastrar, avaliar, ajustarPlano, vincularDocumento } from '../support/flows';
import { avaliacoesPath } from '../support/client';

test('CT03 - TAE ajusta após devoluções do gestor e da fundação @api @avaliacao @ajuste', async ({ api }) => {
  const plano = await cadastrar(api, { comFundacao: true });
  await avaliar(api, plano.id, 'Gestor Financeiro', 'Aguardando Ajustes');
  await api.conferirSituacao(plano.id, 'Aguardando Ajustes');
  await ajustarPlano(api, plano.id, 123);
  await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
  await avaliar(api, plano.id, 'Direção Fundação', 'Aguardando Ajustes');
  await api.conferirSituacao(plano.id, 'Aguardando Ajustes');
  await ajustarPlano(api, plano.id, 1234);
  await avaliar(api, plano.id, 'Direção Fundação', 'Aprovada');
  await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
  const sei = await (
    await api.ok(await api.request.post(`${avaliacoesPath}/criar-processo-sei/${plano.id}`, { data: {} }))
  ).json();
  await vincularDocumento(api, plano.id, sei.numeroProcesso);
  expect((await api.plano(plano.id)).etapasCronograma[0].numero).toBe(1234);
});
