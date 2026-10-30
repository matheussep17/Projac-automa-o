import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT04 - cadastra fora de execucao sem fundacao @cadastro @fora-execucao @sem-fundacao', async ({ page }) =>
  cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: false }));
