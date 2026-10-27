import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT04 - cadastro fora de execução sem fundação @cadastro @fora-execucao @sem-fundacao', async ({ page }) => cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: false }));
