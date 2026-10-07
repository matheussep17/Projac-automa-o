import { expect, Page } from '@playwright/test';

export class TratamentoTributarioPage {
  constructor(private readonly page: Page) {}

  async preencher(): Promise<void> {
    await this.page.getByText('Tratamento tributário', { exact: true }).last().click();
    await this.page.getByRole('combobox').first().click({ force: true });
    await this.page.getByRole('option', { name: 'Bolsa', exact: true }).click();
    const modalidade = this.page.getByLabel('Modalidade de bolsa');
    await modalidade.click({ force: true });
    await modalidade.press('ArrowDown');
    await modalidade.press('Enter');
    await expect(this.page.getByRole('combobox', { name: 'Modalidade de bolsa' })).toHaveText(/.+/);
    await this.page.getByLabel('Justificativa').fill(
      'Tratamento tributário definido conforme a modalidade de bolsa e a natureza do projeto.',
    );
    await this.page.keyboard.press('Escape');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click({ force: true });
  }
}
