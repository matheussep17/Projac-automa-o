import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT02 - cadastra em execucao sem fundacao @cadastro @execucao @sem-fundacao', async ({ page }) =>
  cadastrarPlanoFinanceiro(page, { emExecucao: true, comFundacao: false, comDocumentoContratual: true }));
