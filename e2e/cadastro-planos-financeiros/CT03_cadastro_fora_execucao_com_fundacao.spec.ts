import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT03 - cadastra fora de execucao com fundacao @cadastro @fora-execucao @fundacao', async ({ page }) =>
  cadastrarPlanoFinanceiro(page, { emExecucao: false, comFundacao: true }));
