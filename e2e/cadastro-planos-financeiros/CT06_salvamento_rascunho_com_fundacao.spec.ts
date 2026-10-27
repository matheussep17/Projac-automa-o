import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT06 - rascunho em execução com fundação @cadastro @rascunho @fundacao', async ({ page }) => cadastrarPlanoFinanceiro(page, { emExecucao: true, comFundacao: true, salvarComoRascunho: true, comDocumentoContratual: true }));
