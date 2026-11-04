import { test, expect } from '../support/fixtures';
import { prepararRemanejamento, solicitarRemanejamento, avaliarRemanejamentoApi } from '../support/remanejamento';

const [ct, comFundacao] = ["CT04",false] as const;

test(`${ct} - reprova remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento @reprovacao`, async ({ api }) => {
    const plano = await prepararRemanejamento(api, comFundacao);
    const etapaOriginal = plano.etapasCronograma[0].numero;
    await solicitarRemanejamento(api, plano.id, 12);
    await avaliarRemanejamentoApi(api, plano.id, comFundacao ? 'Direção Fundação' : 'Gestor Financeiro', 'Reprovada');
    await api.perfil('Gestor Financeiro');
    const salvo = await api.conferirSituacao(plano.id, 'Em execução');
    expect(salvo.etapasCronograma[0].numero).toBe(etapaOriginal);
  });
