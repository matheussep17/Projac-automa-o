import { expect, Page } from '@playwright/test';

export class ProjetoPage {
  constructor(private readonly page: Page) {}

  async selecionarNaturezaEProjeto(): Promise<void> {
    await this.page.getByRole('tab', { name: 'Dados do Projeto' }).click();
    await this.page.getByRole('combobox', { name: 'Natureza' }).click();
    await this.page.getByRole('option', { name: 'Pesquisa', exact: true }).click();
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
