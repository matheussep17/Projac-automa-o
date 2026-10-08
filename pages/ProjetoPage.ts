import { expect, Page } from '@playwright/test';

export class ProjetoPage {
  constructor(private readonly page: Page) {}

  async selecionarNaturezaEProjeto(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do Projeto' }).click();
    const natureza = this.page.getByRole('combobox', { name: 'Natureza' });
    const pesquisa = this.page.getByRole('option', { name: 'Pesquisa', exact: true });
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      await natureza.click();
      await natureza.press('ArrowDown');
      if (await pesquisa.isVisible().catch(() => false)) break;
      await this.page.waitForTimeout(500);
    }
    await expect(pesquisa).toBeVisible({ timeout: 10_000 });
    await pesquisa.click();
    await this.page.getByRole('combobox', { name: 'Projeto' }).click();
    await this.page.getByRole('option').first().click();
    await expect(this.page.getByRole('combobox', { name: 'Projeto' })).toHaveValue(/.+/);
  }

  async anexarExtrato(arquivo: string): Promise<void> {
    const chooser = this.page.waitForEvent('filechooser');
    await this.page.getByRole('button', { name: 'Selecionar arquivo', exact: true }).click();
    await (await chooser).setFiles(arquivo);
  }
}
