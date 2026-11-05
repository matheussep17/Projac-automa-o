import { test } from '../support/fixtures';
import { timeouts } from '../../config/timeouts';
import {
  prepararRemanejamento,
  solicitarRemanejamento,
  avaliarRemanejamentoApi,
  concluirRemanejamento,
} from '../support/remanejamento';

test('CT08 - aprova dois remanejamentos no mesmo plano sem fundação @api @remanejamento', async ({ api }) => {
  test.setTimeout(timeouts.remanejamento);
  const plano = await prepararRemanejamento(api, false);

  for (const etapa of [12, 123]) {
    await test.step(`Remanejamento para etapa ${etapa} no mesmo plano`, async () => {
      await solicitarRemanejamento(api, plano.id, etapa);
+      await avaliarRemanejamentoApi(api, plano.id, 'Gestor Financeiro', 'Aprovada');
      await concluirRemanejamento(api, plano.id, etapa);
    });
  }
});
