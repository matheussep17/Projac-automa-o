import { test, expect } from '@playwright/test';

test.describe('CT01 - Cadastro, edição e exclusão de encargo trabalhista', () => {
  test('deve cadastrar, editar e excluir um encargo trabalhista', async ({ page }) => {
    const nomeInicial = `Encargo de teste CT01 ${Date.now()}`;
    const nomeEditado = `${nomeInicial} - editado`;

    await page.goto('https://projetosacademicos-dev.ufg.br/projac/cadastros/encargos-trabalhistas');

    await expect(page.getByRole('heading', { name: 'Encargos Trabalhistas' })).toBeVisible();

    // Cadastro
    await page.getByRole('button', { name: 'Cadastrar', exact: true }).click();
    await page.getByLabel('Benefício/gratificação', { exact: true }).fill(nomeInicial);
    await page.getByLabel('Fundação', { exact: true }).click();
    await page.getByRole('option', { name: 'Fundação de Apoio à Pesquisa', exact: true }).click();
    await page.getByLabel('Valor R$', { exact: true }).fill('123,45');
    await page.getByLabel('Ano de referência', { exact: true }).fill('2026');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();

    await expect(page.getByText('Benefício cadastrado(a) com sucesso!')).toBeVisible();
    const linhaCriada = page.getByRole('row').filter({ hasText: nomeInicial });
    await expect(linhaCriada).toContainText('R$ 123,45');

    // Edição
    await linhaCriada.getByRole('button', { name: 'Editar', exact: true }).click();
    await page.getByLabel('Benefício/gratificação', { exact: true }).fill(nomeEditado);
    await page.getByLabel('Valor R$', { exact: true }).fill('234,56');
    await page.getByRole('button', { name: 'Salvar', exact: true }).click();

    await expect(page.getByText('Benefício alterado(a) com sucesso!')).toBeVisible();
    const linhaEditada = page.getByRole('row').filter({ hasText: nomeEditado });
    await expect(linhaEditada).toContainText('R$ 234,56');

    // Exclusão
    await linhaEditada.getByRole('button', { name: 'Excluir', exact: true }).click();
    await expect(page.getByText(`Você realmente deseja remover o item ${nomeEditado}?`)).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar', exact: true }).click();

    await expect(page.getByText('Item excluído(a) com sucesso!')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: nomeEditado })).toHaveCount(0);
  });
});
