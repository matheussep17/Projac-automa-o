import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT01 - cadastra em execucao com fundacao @cadastro @execucao @fundacao', async ({ page }) =>
  cadastrarPlanoFinanceiro(page, { emExecucao: true, comFundacao: true, comDocumentoContratual: true }));
