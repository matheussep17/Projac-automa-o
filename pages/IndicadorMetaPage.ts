import { expect, Page } from '@playwright/test';

export class IndicadorMetaPage {
  constructor(private readonly page: Page) {}

  async adicionarIndicador(): Promise<void> {
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('textbox', { name: 'Meta', exact: true }).fill('Concluir a etapa de pesquisa');
    const etapas = this.page.getByRole('dialog').getByRole('combobox', {
      name: 'Etapas Cronograma',
      exact: true,
    });
    await etapas.focus();
    await etapas.press('Enter');
    await expect(etapas).toHaveAttribute('aria-expanded', 'true');
    await this.page.getByRole('listbox').getByRole('option', { name: /^1\b/ }).click();
    await expect(etapas).toContainText(/^\s*1\b/);
    if ((await etapas.getAttribute('aria-expanded')) === 'true') {
      await etapas.press('Escape');
    }
    await expect(etapas).toHaveAttribute('aria-expanded', 'false');
    await this.page
      .getByRole('textbox', { name: 'Indicador de cumprimento das metas', exact: true })
      .fill('Percentual de execução da etapa');
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
