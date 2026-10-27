import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT08 - cadastro fora de execução sem participante @cadastro @fora-execucao', async ({ page }) => cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true, comParticipante: false }));
