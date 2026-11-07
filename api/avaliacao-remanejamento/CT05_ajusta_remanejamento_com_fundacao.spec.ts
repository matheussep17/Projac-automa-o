import { test } from '../support/fixtures';
import {
  prepararRemanejamento,
  solicitarRemanejamento,
  avaliarRemanejamentoApi,
  reenviarAjuste,
  concluirRemanejamento,
} from '../support/remanejamento';

const [ct, comFundacao] = ['CT05', true] as const;

test(`${ct} - ajusta e reavalia remanejamento ${comFundacao ? 'com' : 'sem'} fundação @api @remanejamento @ajuste`, async ({
  api,
}) => {
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
