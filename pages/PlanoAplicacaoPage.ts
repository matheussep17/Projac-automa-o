import { expect, Page } from '@playwright/test';

export class PlanoAplicacaoPage {
  constructor(private readonly page: Page) {}

  async preencher(comFundacao: boolean): Promise<void> {
    await this.page.getByLabel('Justificativa').fill('Não se aplicam custos indiretos para este cenário.');
    const dao = this.page.getByLabel('Valor DAO a ser aplicado');
    if (comFundacao) {
      await dao.fill('');
      await dao.pressSequentially('1000');
      await expect(dao).toHaveValue(/10,00/);
    } else {
      await expect(dao).toBeDisabled();
    }

    await this.page.getByRole('button', { name: 'Adicionar' }).click();
    await this.page.getByRole('combobox', { name: 'Rubrica', exact: true }).first().click({ force: true });
    await this.page.getByRole('option', { name: 'Pessoal, encargos sociais e benefícios', exact: true }).click();
    await this.page.getByRole('combobox', { name: 'Rubrica', exact: true }).nth(1).click({ force: true });
    await this.page.getByRole('option', { name: 'Bolsas', exact: true }).click();
    const valor = this.page.getByRole('textbox', { name: 'Valor da Sub-rubrica', exact: true });
    await valor.fill('');
    await valor.pressSequentially(comFundacao ? '990000' : '1000000');
    await expect(valor).toHaveValue(comFundacao ? /9\.900,00/ : /10\.000,00/);
    await this.page.getByRole('button', { name: 'Adicionar', exact: true }).last().click();

    const cipUfg = this.page.getByRole('textbox', { name: 'Custos indiretos para a UFG' });
    const cipUnidade = this.page.getByRole('textbox', { name: 'Custos indiretos para a UA/Órgão' });
    await cipUfg.fill('');
    await cipUfg.pressSequentially('0');
    await cipUnidade.fill('');
    await cipUnidade.pressSequentially('0');
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
