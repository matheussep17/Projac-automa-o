import { test } from '../support/fixtures';
import { prepararRemanejamento, solicitarRemanejamento, avaliarRemanejamentoApi, concluirRemanejamento } from '../support/remanejamento';

const [ct, comFundacao] = ["CT02",false] as const;

test(`${ct} - aprova remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento`, async ({ api }) => {
    const plano = await prepararRemanejamento(api, comFundacao);
    await solicitarRemanejamento(api, plano.id, 12);
    if (comFundacao) await avaliarRemanejamentoApi(api, plano.id, 'Direção Fundação', 'Aprovada');
    await avaliarRemanejamentoApi(api, plano.id, 'Gestor Financeiro', 'Aprovada');
    await concluirRemanejamento(api, plano.id, 12);
  });
