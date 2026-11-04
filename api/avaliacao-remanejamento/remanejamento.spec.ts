import { test, expect } from '../support/fixtures';
import { prepararRemanejamento, solicitarRemanejamento, avaliarRemanejamentoApi, reenviarAjuste, concluirRemanejamento } from '../support/remanejamento';

for (const [ct, comFundacao] of [['CT01', true], ['CT02', false]] as const) {
  test(`${ct} - aprova remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento`, async ({ api }) => {
    const plano = await prepararRemanejamento(api, comFundacao);
    await solicitarRemanejamento(api, plano.id, 12);
    if (comFundacao) await avaliarRemanejamentoApi(api, plano.id, 'Direção Fundação', 'Aprovada');
    await avaliarRemanejamentoApi(api, plano.id, 'Gestor Financeiro', 'Aprovada');
    await concluirRemanejamento(api, plano.id, 12);
  });
}

for (const [ct, comFundacao] of [['CT03', true], ['CT04', false]] as const) {
  test(`${ct} - reprova remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento @reprovacao`, async ({ api }) => {
    const plano = await prepararRemanejamento(api, comFundacao);
    const etapaOriginal = plano.etapasCronograma[0].numero;
    await solicitarRemanejamento(api, plano.id, 12);
    await avaliarRemanejamentoApi(api, plano.id, comFundacao ? 'Direção Fundação' : 'Gestor Financeiro', 'Reprovada');
    await api.perfil('Gestor Financeiro');
    const salvo = await api.conferirSituacao(plano.id, 'Em execução');
    expect(salvo.etapasCronograma[0].numero).toBe(etapaOriginal);
  });
}

for (const [ct, comFundacao] of [['CT05', true], ['CT06', false]] as const) {
  test(`${ct} - ajusta e reavalia remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento @ajuste`, async ({ api }) => {
    const plano = await prepararRemanejamento(api, comFundacao);
    await solicitarRemanejamento(api, plano.id, 12);
    if (comFundacao) {
      const devolucao = await avaliarRemanejamentoApi(api, plano.id, 'Direção Fundação', 'Aguardando Ajustes');
      await reenviarAjuste(api, plano.id, devolucao, 123);
      await avaliarRemanejamentoApi(api, plano.id, 'Direção Fundação', 'Aprovada');
    }
    const devolucao = await avaliarRemanejamentoApi(api, plano.id, 'Gestor Financeiro', 'Aguardando Ajustes');
    const etapaFinal = comFundacao ? 1234 : 123;
    await reenviarAjuste(api, plano.id, devolucao, etapaFinal);
    if (comFundacao) await avaliarRemanejamentoApi(api, plano.id, 'Direção Fundação', 'Aprovada');
    await avaliarRemanejamentoApi(api, plano.id, 'Gestor Financeiro', 'Aprovada');
    await concluirRemanejamento(api, plano.id, etapaFinal);
  });
}
