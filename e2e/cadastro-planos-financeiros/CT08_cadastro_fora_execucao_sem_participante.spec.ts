import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT08 - cadastra sem participante @cadastro @fora-execucao', async ({ page }) => {
  await cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true, comParticipante: false });
});
