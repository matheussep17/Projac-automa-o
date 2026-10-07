import { Page } from '@playwright/test';

export class IndicadorMetaPage {
  constructor(private readonly page: Page) {}

  async adicionarIndicador(): Promise<void> {
    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('textbox', { name: 'Meta', exact: true }).fill('Concluir a etapa de pesquisa');
    await this.page.getByLabel('Etapas Cronograma').click({ force: true });
    await this.page.getByRole('combobox', { name: 'Etapas Cronograma' }).press('Enter');
    await this.page.getByRole('option', { name: /^1\b/ }).last().click();
    await this.page
      .getByRole('textbox', { name: 'Indicador de cumprimento das metas', exact: true })
      .fill('Percentual de execução da etapa');
    await this.page.getByRole('dialog').getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
