import { test, expect } from '../support/fixtures';
import { cadastrar, avaliar, aprovar, ajustarPlano, vincularDocumento } from '../support/flows';
import { avaliacoesPath } from '../support/client';

for (const [ct, comFundacao] of [['CT01', true], ['CT02', false]] as const) {
  test(`${ct} - aprova plano ${comFundacao ? 'com' : 'sem'} fundação @api @avaliacao`, async ({ api }) => {
    const plano = await cadastrar(api, { comFundacao });
    await aprovar(api, plano, comFundacao);
    const salvo = await api.conferirSituacao(plano.id, 'Em execução');
    expect(salvo.instrumentosFormalizacao).toHaveLength(1);
  });
}

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
  const sei = await (await api.ok(await api.request.post(`${avaliacoesPath}/criar-processo-sei/${plano.id}`, { data: {} }))).json();
  await vincularDocumento(api, plano.id, sei.numeroProcesso);
  expect((await api.plano(plano.id)).etapasCronograma[0].numero).toBe(1234);
});

for (const c of [
  { ct: 'CT04', comFundacao: true, etapa: 'gestor' },
  { ct: 'CT05', comFundacao: true, etapa: 'fundacao' },
  { ct: 'CT06', comFundacao: true, etapa: 'gestor-final' },
  { ct: 'CT07', comFundacao: false, etapa: 'gestor' },
]) {
  test(`${c.ct} - reprova no ${c.etapa} ${c.comFundacao ? 'com' : 'sem'} fundação @api @avaliacao @reprovacao`, async ({ api }) => {
    const plano = await cadastrar(api, { comFundacao: c.comFundacao });
    if (c.etapa === 'gestor') await avaliar(api, plano.id, 'Gestor Financeiro', 'Reprovada');
    else {
      await avaliar(api, plano.id, 'Gestor Financeiro', 'Aprovada');
      await avaliar(api, plano.id, 'Direção Fundação', c.etapa === 'fundacao' ? 'Reprovada' : 'Aprovada');
      if (c.etapa === 'gestor-final') await avaliar(api, plano.id, 'Gestor Financeiro', 'Reprovada');
    }
    await api.conferirSituacao(plano.id, 'Reprovada');
  });
}

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

for (const [ct, comFundacao] of [['CT09', true], ['CT10', false]] as const) {
  test(`${ct} - aprova sem documento ${comFundacao ? 'com' : 'sem'} fundação @api @avaliacao @sei`, async ({ api }) => {
    const plano = await cadastrar(api, { comFundacao });
    await aprovar(api, plano, comFundacao, false);
    const salvo = await api.conferirSituacao(plano.id, 'Aprovada');
    expect(salvo.instrumentosFormalizacao).toHaveLength(0);
  });
}
