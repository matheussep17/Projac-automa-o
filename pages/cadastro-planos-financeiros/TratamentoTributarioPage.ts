import { expect, Page } from '@playwright/test';
import { tratamentoTributarioData } from '../../test-data';

export class TratamentoTributarioPage {
  constructor(private readonly page: Page) {}

  async preencher(): Promise<void> {
    const tratamento = this.page.getByRole('combobox', { name: 'Tratamento tributário', exact: true });
    await expect(tratamento).toBeEnabled();
    await tratamento.focus();
    await tratamento.press('Enter');
    await expect(tratamento).toHaveAttribute('aria-expanded', 'true');
    await this.page.getByRole('listbox').getByRole('option', { name: 'Bolsa', exact: true }).click();
    await expect(tratamento).toHaveAttribute('aria-expanded', 'false');
    await expect(tratamento).toHaveText('Bolsa');
    const modalidade = this.page.getByRole('combobox', {
      name: 'Modalidade de bolsa',
      exact: true,
    });
    await expect(modalidade).toBeEnabled();
    await modalidade.focus();
    await modalidade.press('Enter');
    await this.page
      .getByRole('listbox')
      .getByRole('option', {
        name: 'Ensino - Resolução 83 - 2021',
        exact: true,
      })
      .click();
    await expect(modalidade).toHaveAttribute('aria-expanded', 'false');
    await expect(modalidade).toHaveText('Ensino - Resolução 83 - 2021');
    await this.page.getByLabel('Justificativa').fill(tratamentoTributarioData.justificativa);
    await this.page.keyboard.press('Escape');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click({ force: true });
  }
}
