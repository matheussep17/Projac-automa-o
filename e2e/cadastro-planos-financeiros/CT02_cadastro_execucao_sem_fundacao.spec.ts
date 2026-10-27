import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT02 - cadastro em execução sem fundação @cadastro @execucao @sem-fundacao', async ({ page }) => cadastrarPlanoFinanceiro(page, { emExecucao: true, comFundacao: false, comDocumentoContratual: true }));
