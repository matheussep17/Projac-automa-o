import { expect, Page } from '@playwright/test';
import { planoAplicacaoData } from '../test-data/plano-aplicacao.data';

export class PlanoAplicacaoPage {
  constructor(private readonly page: Page) {}

  async preencher(comFundacao: boolean): Promise<void> {
    await this.page.getByLabel('Justificativa').fill(planoAplicacaoData.justificativa);
    const dao = this.page.getByLabel('Valor DAO a ser aplicado');
    if (comFundacao) {
      await dao.fill('');
      await dao.pressSequentially(planoAplicacaoData.valorDao);
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
    await valor.pressSequentially(comFundacao ? planoAplicacaoData.valorComFundacao : planoAplicacaoData.valorSemFundacao);
    await expect(valor).toHaveValue(comFundacao ? /9\.900,00/ : /10\.000,00/);
    await this.page.getByRole('button', { name: 'Adicionar', exact: true }).last().click();

    const cipUfg = this.page.getByRole('textbox', { name: 'Custos indiretos para a UFG' });
    const cipUnidade = this.page.getByRole('textbox', { name: 'Custos indiretos para a UA/Órgão' });
    await cipUfg.fill('');
    await cipUfg.pressSequentially(planoAplicacaoData.zero);
    await cipUnidade.fill('');
    await cipUnidade.pressSequentially(planoAplicacaoData.zero);
    await this.page.getByRole('button', { name: 'Próxima Etapa' }).click();
  }
}
