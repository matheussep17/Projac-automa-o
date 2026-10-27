import { test } from '../../fixtures/test';
import { cadastrarPlanoFinanceiro } from '../../flows/cadastroPlanoFinanceiro';
test('CT07 - rascunho em execução sem fundação @cadastro @rascunho @sem-fundacao', async ({ page }) => cadastrarPlanoFinanceiro(page, { emExecucao: true, comFundacao: false, salvarComoRascunho: true, comDocumentoContratual: true }));
