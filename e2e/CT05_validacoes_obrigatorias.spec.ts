import { expect } from '@playwright/test';
import { test } from '../fixtures/test';

test.describe('Validações de campos obrigatórios @negativo', () => {
  test('deve impedir avanço quando o cadastro está vazio', async ({ page }) => {
    await page.getByText('Cadastrar Plano de Trabalho Financeiro', { exact: true }).first().click();
    await expect(page).toHaveURL(/plano-trabalho-financeiro\/new/);

    await page.getByRole('button', { name: 'Próxima Etapa' }).click();

    await expect(page.getByText(/obrigat|preench/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Conferência de Dados' })).toHaveCount(0);
  });
});
